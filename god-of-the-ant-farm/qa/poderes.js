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
// Ressurreição, Fantasmas (r1–r3, f1–f2: ver abaixo)
// Amor Divino
//  a1 dois da mesma cidade correm um para o outro e viram um casal
//  a2 de povos diferentes: um vai morar na cidade do outro, e os povos se estimam mais
//  a3 o amado morre no caminho (ninguém casa, quem corria fica de luto); um save no meio carregado duas vezes
// Duelo de Campeões (no mundo pronto «guerra mundial»)
//  d1 os dois campeões lutam sozinhos; quem vence ganha o nome de Campeão; quem perde, o seu lado foge
//  d2 um save no meio do duelo carregado duas vezes; o raio do deus num dos campeões
// Sonho Coletivo
//  s1 a grande obra, os deuses, a terra além do mar, a paz (numa guerra provocada); o mesmo povo não sonha duas vezes seguidas
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
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'mundial.js') }); // (a world at war, for the duel of champions)
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | ${name} | ${info}`); if (!cond) fails.push(name); };
  // the helpers every test uses: the ready world, steps of the world, the checker
  await page.evaluate(key => {
    window.__H = {
      fresh(w) { G.Save.apply(JSON.parse(G.Ready.data[w || key])); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true; G.S.faith = 999; __H.base = new Set(QA.check().filter(e => e.sev <= 3).map(__H.qkey)); },
      // (what the world already had when it was loaded — a ready world's own small faults — is not this test's)
      qkey: e => e.id + '|' + e.msg.replace(/\s*\([^)]*\)\s*$/, ''),
      run(sec, each) { const S = G.S; const n = Math.round(sec / 0.05); for (let k = 0; k < n; k++) { G.debug.step(0.05); if (each) each(k); } return S.clock; },
      qa() { return QA.check().filter(e => e.sev <= 3 && !(__H.base && __H.base.has(__H.qkey(e)))); },
      // (the world-war world lives a steady trickle of newcomers who cannot walk home yet — S3 "recente", the same with or
      // without these powers, settled by the stray rule the next morning: in a battle there, what counts is S0–S2 and the
      // war's and the duel's own S3)
      qaWar() { return QA.check().filter(e => e.sev <= 2 || (e.sev === 3 && (e.sys === 'war' || e.sys === 'fado'))); },
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

  // ------------------------------ Ressurreição ------------------------------
  await page.evaluate(() => {
    // a married adult of the biggest town, free and on the ground
    __H.mate = set => [...G.S.villagers.values()].filter(v => v.set === set.id && v.partner && G.S.villagers.has(v.partner) && v.age >= 18 && v.age < 55 && !v.captive && !v.aboard && !v.ug && !v.jail && !v.inside && !(v.task && v.task.type === 'scene')).sort((a, b) => a.id - b.id)[0];
    __H.raise = (x, y, id) => { const o = G.Powers.options('resurrect', x, y) || []; const k = o.find(q => +q.k === id); return k ? G.Powers.castChoice('resurrect', x, y, k.k) : 'não está entre as escolhas: ' + o.map(q => q.name).join(', '); };
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); const v = H.mate(set); if (!v) return null;
      const id = v.id, name = v.name, mate = v.partner, kids = v.kids.slice(), x = v.x, y = v.y;
      G.Village.kill(v, 'war', true); H.run(0.5);
      const body = G.Carnage.byVid(id);
      const cast = H.raise(body ? body.x : x, body ? body.y : y, id);
      H.run(2);
      const w = S.villagers.get(id); const m = S.villagers.get(mate);
      return { name, cast, body: !!body, back: !!w, dead: S.dead.has(id), corpse: !!G.Carnage.byVid(id), sameName: w && w.name === name, together: !!(w && m && w.partner === m.id && m.partner === w.id && !m.widow), kids: w ? w.kids.length + '/' + kids.length : '-', bio: w ? (w.bio || []).some(e => /Voltou dos mortos/.test(e[2] || '')) : false, qa: H.qa() };
    });
    if (r) ok('r1 ressurreição de um corpo: volta igual e casad' + 'o de novo', r.cast === true && r.body && r.back && !r.dead && !r.corpse && r.sameName && r.together && r.bio && !r.qa.length, `${r.name}: corpo ${r.body}; lançado ${r.cast}; vivo ${r.back}, no registro dos mortos ${r.dead}, corpo no chão ${r.corpse}; casal de novo ${r.together}; filhos ${r.kids}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); const v = H.mate(set); if (!v) return null;
      const id = v.id, name = v.name, mateId = v.partner;
      G.Village.kill(v, 'sick', true); H.run(0.5);
      const rec = S.dead.get(id); const cem = rec && S.buildings.get(rec.grave); if (!cem) return { name, grave: false };
      // the widow marries again before the god acts: she does not go back
      const mate = S.villagers.get(mateId); const other = [...S.villagers.values()].find(o => o.set === set.id && o.g !== mate.g && !o.partner && o.age >= 18 && o.id !== mate.mother && o.id !== mate.father && o.mother !== mate.id && !(mate.mother && o.mother === mate.mother));
      if (other) { mate.partner = other.id; other.partner = mate.id; mate.widow = 0; }
      const [cx, cy] = G.Village.center(cem);
      const cast = H.raise(cx, cy, id); H.run(2);
      const w = S.villagers.get(id);
      const empty = !(cem.graves || []).includes(id);
      // the world with them back goes through a save
      const back = JSON.parse(G.Save.serialize()); G.Save.apply(back); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(1);
      const w2 = G.S.villagers.get(id);
      return { name, grave: true, cast, back: !!w, empty, single: w ? !w.partner : null, mateStays: other ? G.S.villagers.get(mateId).partner === other.id : 'sem par', saved: !!(w2 && w2.name === name), qa: H.qa() };
    });
    if (r) ok('r2 ressurreição da cova: a cova fica vazia; a viúva casada de novo não volta', r.grave && r.cast === true && r.back && r.empty && r.single && r.mateStays !== false && r.saved && !r.qa.length, `${r.name}: cova ${r.grave}; lançado ${r.cast}; vivo ${r.back}; cova vazia ${r.empty}; sozinho ${r.single}; o par fica com o novo ${r.mateStays}; passou pelo save ${r.saved}; ${(r.qa || []).slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); const v = H.mate(set); if (!v) return null;
      const id = v.id;
      // dies, comes back, dies again (the god's lightning), comes back again
      G.Village.kill(v, 'sick', true); H.run(0.5);
      let rec = S.dead.get(id); let cem = S.buildings.get(rec.grave); let [cx, cy] = G.Village.center(cem);
      const a = H.raise(cx, cy, id); H.run(1);
      const w = S.villagers.get(id); G.Powers.lightning(w.x, w.y); H.run(0.5);
      const died2 = !S.villagers.has(id);
      if (!died2) G.Village.kill(w, 'lightning', true), H.run(0.5);
      const body = G.Carnage.byVid(id); rec = S.dead.get(id); cem = rec && S.buildings.get(rec.grave);
      const [px, py] = body ? [body.x, body.y] : cem ? G.Village.center(cem) : [w.x, w.y];
      const b = H.raise(px, py, id); H.run(1);
      return { a, b, died2, back: S.villagers.has(id), dead: S.dead.has(id), qa: H.qa() };
    });
    if (r) ok('r3 volta, morre de novo, volta de novo', r.a === true && r.b === true && r.back && !r.dead && !r.qa.length, `primeira volta ${r.a}; o raio ${r.died2 ? 'matou' : 'não matou (morte forçada)'}; segunda volta ${r.b}; vivo ${r.back}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
  }

  // ------------------------------ Fantasmas ------------------------------
  await page.evaluate(() => {
    __H.cem = set => [...G.S.buildings.values()].filter(b => b.type === 'cemetery' && b.set === set.id && (b.graves || []).some(id => G.S.dead.has(id))).sort((a, b) => (b.graves || []).length - (a.graves || []).length)[0];
    __H.toNight = () => { const S = G.S; while (!(S.time > 0.76)) __H.run(1); };
    __H.ghostsCast = cem => { const [cx, cy] = G.Village.center(cem); return G.Powers.cast('ghosts', cx, cy); };
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town(); let cem = H.cem(set);
      // (a town that never buried anyone gets its first dead)
      if (!cem) { const v = [...S.villagers.values()].find(o => o.set === set.id && o.age > 40); G.Village.kill(v, 'old'); cem = H.cem(set); }
      if (!cem) return null;
      // a thief nobody caught, and one who killed and was not punished
      const th = [...S.villagers.values()].find(o => o.set === set.id && o.age >= 18 && o.home && !o.jail && !o.captive);
      const house = [...S.buildings.values()].find(b => b.set === set.id && b.built && G.BDEF[b.type].housing && b.id !== th.home);
      const crime = { id: S.nextId++, kind: 'furto', day: S.day, set: set.id, thief: th.id, house: house.id, n: 3, x: house.x, y: house.y, seen: [], told: 0, found: 0, st: 'aberto' };
      (S.crimes = S.crimes || []).push(crime); th.purse = (th.purse || 0) + 3;
      const killer = [...S.villagers.values()].find(o => o.set === set.id && o.age >= 18 && o !== th && !o.captive && !o.jail);
      const victim = [...S.villagers.values()].find(o => o.set === set.id && o.age >= 18 && o !== th && o !== killer && !o.captive && !o.jail && !o.aboard);
      victim.lastBy = killer.id; G.Village.kill(victim, 'sick'); H.run(0.5);
      cem = S.buildings.get((S.dead.get(victim.id) || {}).grave) || cem;
      const fear0 = killer.fear;
      const ok = H.ghostsCast(cem); const h = S.beyond && S.beyond.haunts[0];
      const again = G.Powers.canCast('ghosts', ...G.Village.center(cem)); const why = G.Powers.why;
      H.toNight();
      let maxFled = 0, bad = []; const day0 = S.day;
      while (S.beyond.haunts.length && S.day < day0 + 4) { H.run(5); maxFled = Math.max(maxFled, h.fled); const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(q => q.msg)); }
      const hunted = [...S.villagers.values()].some(g => g.hunt === crime.id) || crime.st !== 'aberto';
      return { set: set.name, ok, again, why, ghosts: h ? h.ghosts.length : 0, seen: h ? h.seen : 0, fled: maxFled, told: h ? h.told.slice() : [], theft: h ? h.told.includes('c' + crime.id) : false, hunted, crimeSt: crime.st, killer: h ? h.told.includes('k' + killer.id) : false, fear0, fear1: killer.fear, kbio: (killer.bio || []).some(e => /fantasma/.test(e[2] || '')), ended: !S.beyond.haunts.length, bad, qa: H.qa() };
    });
    if (!r) ok('f1 fantasmas', false, 'nenhuma cidade com cemitério');
    else {
      ok('f1 fantasmas: andam à noite, o povo vê e foge', r.ok && r.ghosts >= 1 && r.seen >= 3 && r.ended && !r.again && !r.bad.length && !r.qa.length, `${r.set}: ${r.ghosts} fantasmas; ${r.seen} pessoas viram, ${r.fled} fugiram; terminou ${r.ended}; de novo no mesmo cemitério: ${r.why}; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
      ok('f1 o fantasma aponta o ladrão', r.theft && r.hunted, `contou o roubo ${r.theft}; guarda atrás do ladrão (ou já preso) ${r.hunted} (crime: ${r.crimeSt})`);
      ok('f1 o fantasma vai atrás de quem o matou', r.killer && r.fear1 > r.fear0 && r.kbio, `foi atrás ${r.killer}; medo do assassino ${Math.round(r.fear0)} → ${Math.round(r.fear1)}; biografia ${r.kbio}`);
    }
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S;
      const set = H.town();
      // (one who died just now lies in the cemetery: their ghost is one the god can still bring back)
      const fresh = [...S.villagers.values()].find(o => o.set === set.id && o.age >= 18 && !o.captive && !o.aboard && !o.jail);
      G.Village.kill(fresh, 'sick'); H.run(0.5);
      const cem = S.buildings.get((S.dead.get(fresh.id) || {}).grave) || H.cem(set); if (!cem) return null;
      H.ghostsCast(cem); H.toNight(); H.run(10);
      const save = G.Save.serialize(); const n = S.beyond.haunts[0].ghosts.length;
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(25); const a = H.digest(cem.x, cem.y) + JSON.stringify(G.S.beyond);
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(25); const b = H.digest(cem.x, cem.y) + JSON.stringify(G.S.beyond);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      // then one of the dead is brought back while walking, and the god razes the cemetery
      const g = G.S.beyond.haunts[0].ghosts.find(q => q.vid === fresh.id) || G.S.beyond.haunts[0].ghosts[0]; const rec = G.S.dead.get(g.vid);
      const recent = rec && G.S.day - rec.died <= 6;
      if (recent) { G.S.faith = 999; const [cx, cy] = G.Village.center(G.S.buildings.get(cem.id)); __H.raise(cx, cy, g.vid); }
      H.run(1); const ghostAlive = G.S.beyond.haunts.some(h => h.ghosts.some(q => G.S.villagers.has(q.vid)));
      G.Village.destroyBuilding(G.S.buildings.get(cem.id), 'teste'); H.run(1);
      return { same: a === b, n, at: k, ctx: a.slice(Math.max(0, k - 60), k + 60) + ' ≠ ' + b.slice(Math.max(0, k - 60), k + 60), recent, ghostAlive, left: G.S.beyond.haunts.length, qa: H.qa() };
    });
    if (r) {
      ok('f2 save no meio da assombração: o mesmo futuro', r.same, r.same ? `${r.n} fantasmas na hora do save; futuro idêntico` : `diferem no caractere ${r.at}: ${r.ctx}`);
      ok('f2 o morto que volta deixa de assombrar; cemitério derrubado acaba com tudo', !r.ghostAlive && !r.left && !r.qa.length, `${r.recent ? 'um fantasma ressuscitado' : '(fantasma antigo demais para voltar)'}; fantasma de alguém vivo ${r.ghostAlive}; assombrações depois do cemitério derrubado ${r.left}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
    }
  }

  // ------------------------------ Amor Divino ------------------------------
  await page.evaluate(() => {
    // someone free, in the biggest town, with a choice of suitors (of their people, and — if wanted — of another)
    // (a world of married people: the god first frees a few hearts — the partners of some die — in two peoples)
    __H.toDay = () => { const S = G.S; while (!(S.time > 0.12 && S.time < 0.5)) __H.run(2); };
    __H.freeHearts = () => { __H.toDay(); const S = G.S; const F = G.Fac.all().filter(f => f.alive).sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id)).slice(0, 2); for (const f of F) { let n = 0; for (const v of [...S.villagers.values()].sort((a, b) => a.id - b.id)) { if (n >= 6 || G.Fac.idOfV(v) !== f.id || !v.partner || v.age < 18 || v.age > 45 || v.captive || v.inside) continue; const p = S.villagers.get(v.partner); if (p) { G.Village.kill(p, 'sick'); v.mourn = 0; n++; } } } __H.run(1); };
    __H.lover = foreign => { const S = G.S; for (const v of [...S.villagers.values()].sort((a, b) => a.id - b.id)) { if (v.partner || v.age < 18 || v.age > 45 || v.captive || v.inside || v.aboard || v.jail) continue; const o = G.Powers.options('love', v.x, v.y) || []; const pick = o.find(q => /De outro povo/.test(q.desc) === !!foreign); if (pick && G.Powers.targetAt(v.x, v.y, 1.3) === v) return { v, k: pick.k }; } return null; };
    __H.until = (fn, max) => { let t = 0; while (t < max && !fn()) { __H.run(1); t += 1; } return t; };
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; H.freeHearts();
      const c = H.lover(false); if (!c) return null;
      const v = c.v, o = S.villagers.get(+c.k);
      const ok = G.Powers.castChoice('love', v.x, v.y, c.k);
      const t = H.until(() => v.partner === o.id, 120);
      return { ok, a: v.name, b: o.name, t, wed: v.partner === o.id && o.partner === v.id, bio: (v.bio || []).some(e => e[1] === 'couple'), left: (S.fates.loves || []).length, qa: H.qa() };
    });
    if (!r) ok('a1 amor divino na mesma cidade', false, 'ninguém livre com pretendentes no mundo');
    else ok('a1 amor divino na mesma cidade', r.ok && r.wed && r.bio && !r.left && !r.qa.length, `${r.a} e ${r.b}: casal ${r.wed} em ${r.t}s; biografia ${r.bio}; flechas abertas ${r.left}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; H.freeHearts();
      const c = H.lover(true); if (!c) return null;
      const v = c.v, o = S.villagers.get(+c.k); const fa = G.Fac.idOfV(v), fb = G.Fac.idOfV(o);
      const op0 = (G.Fac.rel(fa, fb) || {}).op || 0;
      G.Powers.castChoice('love', v.x, v.y, c.k);
      const t = H.until(() => v.partner === o.id, 150);
      const op1 = (G.Fac.rel(fa, fb) || {}).op || 0;
      return { a: v.name, b: o.name, t, wed: v.partner === o.id && o.partner === v.id, together: v.set === o.set, op0, op1, legend: (S.lore && S.lore.legends || []).some(l => /^love:/.test(l.key)), qa: H.qa() };
    });
    if (r) ok('a2 amor entre povos: vão morar juntos e os povos se estimam', r.wed && r.together && r.op1 > r.op0 && !r.qa.length, `${r.a} e ${r.b}: casal ${r.wed} em ${r.t}s; mesma cidade ${r.together}; estima entre os povos ${Math.round(r.op0)} → ${Math.round(r.op1)}; lenda ${r.legend}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
    else ok('a2 amor entre povos', false, 'nenhum pretendente de outro povo no mundo');
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; H.freeHearts();
      const c = H.lover(false); if (!c) return null;
      const v = c.v, o = S.villagers.get(+c.k);
      G.Powers.castChoice('love', v.x, v.y, c.k);
      H.run(1.5);
      const save = G.Save.serialize();
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(20); const a = H.digest(v.x, v.y) + JSON.stringify(G.S.fates);
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(20); const b = H.digest(v.x, v.y) + JSON.stringify(G.S.fates);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      // and again from the save: the beloved dies on the way
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      const v2 = G.S.villagers.get(v.id), o2 = G.S.villagers.get(o.id);
      G.Village.kill(o2, 'sick'); H.run(5);
      return { same: a === b, at: k, ctx: a.slice(Math.max(0, k - 60), k + 60) + ' ≠ ' + b.slice(Math.max(0, k - 60), k + 60), single: !v2.partner, mourn: v2.mourn > 0, left: (G.S.fates.loves || []).length, task: v2.task ? v2.task.type : '-', qa: H.qa() };
    });
    if (r) {
      ok('a3 save no meio da corrida do amor: o mesmo futuro', r.same, r.same ? 'futuro idêntico' : `diferem no caractere ${r.at}: ${r.ctx}`);
      ok('a3 o amado morre no caminho', r.single && r.mourn && !r.left && r.task !== 'amor' && !r.qa.length, `sozinho ${r.single}; de luto ${r.mourn}; flechas abertas ${r.left}; tarefa agora ${r.task}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
    }
  }

  // ------------------------------ Duelo de Campeões ------------------------------
  await page.evaluate(() => {
    // a battle of the world at war: two fighters of peoples at war, close to each other
    // (and if nobody is fighting just now, the scenario sets one up on purpose: four fighters of each of two peoples at war,
    // face to face near a town of one of them, already at each other's throats)
    __H.battle = () => {
      const S = G.S; __H.toDay();
      for (const v of S.villagers.values()) { const t = v.task; if (!t || t.type !== 'combat' || t.duel) continue; const o = S.villagers.get(t.id); if (o && G.Fac.atWar(G.Fac.idOfV(v), G.Fac.idOfV(o)) && G.Powers.canCast('duel', v.x, v.y)) return [v.x, v.y]; }
      const fit = sid => [...S.villagers.values()].filter(v => v.set === sid && v.age >= 18 && v.age < 50 && !v.captive && !v.aboard && !v.jail && !v.ug && !v.inside && v.hp > 60).sort((a, b) => a.id - b.id);
      let best = null, bd = 1e18;
      for (const a of S.settlements.values()) for (const b of S.settlements.values()) { if (a.fac === b.fac || !G.Fac.atWar(a.fac, b.fac) || !G.W.townsLinked(a, b) || fit(a.id).length < 4 || fit(b.id).length < 4) continue; const d = G.dist2(a.cx, a.cy, b.cx, b.cy); if (d < bd) { bd = d; best = [a, b]; } }
      if (!best) return null;
      const [A, B] = best; const at = G.W.randomNear(B.cx + 4, B.cy + 4, 4) || [B.cx, B.cy];
      const ma = fit(A.id).slice(0, 4), mb = fit(B.id).slice(0, 4);
      ma.forEach((v, k) => { G.Vg.endTask(v); v.x = at[0] - 0.6; v.y = at[1] + k * 0.4; v.role = 'guerreiro'; });
      mb.forEach((v, k) => { G.Vg.endTask(v); v.x = at[0] + 0.6; v.y = at[1] + k * 0.4; v.role = 'guerreiro'; });
      ma.forEach((v, k) => { G.Vg.H.setTask(v, { type: 'combat', id: mb[k].id, pri: 4.2, kind: 'combat' }); G.Vg.H.setTask(mb[k], { type: 'combat', id: v.id, pri: 4.2, def: true, kind: 'combat' }); });
      __H.run(0.3);
      return G.Powers.canCast('duel', at[0], at[1]) ? at : null;
    };
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh('mundial'); const S = G.S;
      const at = H.battle(); if (!at) return null;
      const ok = G.Powers.cast('duel', at[0], at[1]); const rec = S.fates && S.fates.duels[0];
      if (!rec) return { ok, none: true };
      const again = G.Powers.canCast('duel', at[0], at[1]); const why = G.Powers.why;
      const a = rec.a, b = rec.b, fa = rec.fa, fb = rec.fb;
      const t = H.until(() => !S.fates.duels.length, 100);
      const A = S.villagers.get(a), B = S.villagers.get(b);
      const winner = A && !B ? A : B && !A ? B : null;
      const lines = S.history.slice(-30).map(e => e.txt).filter(x => /duelo de campeões/.test(x));
      const fled = [...G.War.bands.values()].filter(x => x.fac === (winner === A ? fb : fa) && x.retreat).length;
      return { ok, again, why, t, a: G.person(a).name, b: G.person(b).name, winner: winner ? winner.name : null, ep: winner ? winner.ep : null, fled, lines, qa: H.qaWar() };
    });
    if (!r) ok('d1 duelo de campeões', false, 'nenhuma batalha no mundo pronto da guerra mundial');
    else if (r.none) ok('d1 duelo de campeões', false, `lançado ${r.ok}, mas nenhum duelo começou`);
    else {
      ok('d1 duelo de campeões: um vence, o nome fica', r.ok && r.lines.length && (!r.winner || r.ep === 'campeao') && !r.qa.length, `${r.a} × ${r.b}: ${r.winner ? `venceu ${r.winner} (${r.ep}), ${r.fled} bando(s) do outro lado fugiram` : 'sem vencedor'} em ${r.t}s; crônica: ${r.lines.slice(-1)[0] || '-'}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
      ok('d1 um duelo por vez', !r.again && /já está acontecendo/.test(r.why), r.why);
    }
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh('mundial'); const S = G.S;
      const at = H.battle(); if (!at) return null;
      G.Powers.cast('duel', at[0], at[1]); const rec = S.fates && S.fates.duels[0]; if (!rec) return null;
      H.run(3);
      const save = G.Save.serialize();
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(15); const a = H.digest(rec.x, rec.y) + JSON.stringify(G.S.fates);
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(15); const b = H.digest(rec.x, rec.y) + JSON.stringify(G.S.fates);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      // from the save again: the god's lightning strikes one of the champions
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      const c = G.S.villagers.get(rec.a); const other = G.S.villagers.get(rec.b);
      if (c) { G.Powers.lightning(c.x, c.y); if (G.S.villagers.has(c.id)) G.Village.kill(c, 'lightning', true); }
      H.run(3);
      const D = (G.S.fates && G.S.fates.duels) || [];
      const stale = [...G.S.villagers.values()].filter(v => v.task && v.task.champ && !D.some(d => d.id === v.task.champ)).length;
      return { same: a === b, at: k, ctx: a.slice(Math.max(0, k - 60), k + 60) + ' ≠ ' + b.slice(Math.max(0, k - 60), k + 60), open: D.length, stale, otherEp: other && G.S.villagers.get(other.id) ? G.S.villagers.get(other.id).ep : '-', qa: H.qaWar() };
    });
    if (r) {
      ok('d2 save no meio do duelo: o mesmo futuro', r.same, r.same ? 'futuro idêntico' : `diferem no caractere ${r.at}: ${r.ctx}`);
      ok('d2 o raio do deus num campeão: o duelo acaba limpo', !r.open && !r.stale && !r.qa.length, `duelos abertos ${r.open}; tarefas de duelo órfãs ${r.stale}; o outro campeão: ${r.otherEp}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
    }
  }

  // ------------------------------ Sonho Coletivo ------------------------------
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; const out = {};
      const F = G.Fac.all().filter(f => f.alive).sort((a, b) => G.Fac.pop(b.id) - G.Fac.pop(a.id));
      const dreamOf = (f, k) => { const c = G.Fac.capitalOf(f.id); const o = G.Powers.options('dream', c.cx, c.cy) || []; if (!o.some(q => q.k === k)) return 'sem a opção'; return G.Powers.castChoice('dream', c.cx, c.cy, k); };
      // the gods
      { const f = F[0]; const dev = () => { let n = 0, d = 0; for (const v of S.villagers.values()) if (G.Fac.idOfV(v) === f.id) { n++; d += v.devotion; } return d / n; }; const d0 = dev(); out.fe = [dreamOf(f, 'fe'), Math.round(d0), Math.round(dev())]; out.twice = [G.Powers.canCast('dream', G.Fac.capitalOf(f.id).cx, G.Fac.capitalOf(f.id).cy), G.Powers.why]; }
      // the great work
      { const f = F[1] || F[0]; const c = G.Fac.capitalOf(f.id); const before = [...S.buildings.values()].filter(b => b.type === 'monument' && b.set === c.id).length; out.obra = [dreamOf(f, 'obra'), before, [...S.buildings.values()].filter(b => b.type === 'monument' && b.set === c.id).length]; }
      // the land beyond the sea
      { const f = F[2] || F[0]; const K = G.Know; const before = K.counts ? JSON.stringify(K.counts(f.id)) : ''; out.mar = [dreamOf(f, 'mar'), before, K.counts ? JSON.stringify(K.counts(f.id)) : '']; }
      // peace, in a war made for it
      { const a = F[0], b = F[1]; if (a && b) { const rel = G.Fac.rel(a.id, b.id); if (rel && !rel.met) G.Politics.meet(a, b, { quiet: true }); const dp = S.divinePeace; S.divinePeace = 0; if (!G.Fac.atWar(a.id, b.id)) G.Politics.declareWar(a, b, 'ambicao'); S.divinePeace = dp; S.day += 2; const w0 = G.Fac.atWar(a.id, b.id); out.paz = [w0, dreamOf(b, 'paz'), G.Fac.atWar(a.id, b.id), S.history.slice(-3).map(e => e.txt).join(' | ')]; } }
      H.run(5);
      out.qa = H.qa();
      return out;
    });
    ok('s1 sonho dos deuses: o povo acorda devoto; não sonha duas vezes seguidas', r.fe[0] === true && r.fe[2] > r.fe[1] && !r.twice[0] && /último sonho/.test(r.twice[1]), `devoção média ${r.fe[1]} → ${r.fe[2]}; de novo: ${r.twice[1]}`);
    ok('s1 sonho da grande obra: um monumento começa', r.obra[0] === true && r.obra[2] > r.obra[1], `lançado ${r.obra[0]}; monumentos na capital ${r.obra[1]} → ${r.obra[2]}`);
    ok('s1 sonho da terra além do mar', r.mar[0] === true ? r.mar[2] !== r.mar[1] : r.mar[0] === 'sem a opção', `lançado ${r.mar[0]}; conhecimento ${r.mar[1]} → ${r.mar[2]}`);
    if (r.paz) ok('s1 sonho da paz numa guerra', r.paz[0] && r.paz[1] === true && /sonhou com a paz/.test(r.paz[3]), `em guerra ${r.paz[0]}; lançado ${r.paz[1]}; ainda em guerra ${r.paz[2]}; crônica: ${r.paz[3].slice(0, 200)}`);
    ok('s1 verificador', !r.qa.length, r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'limpo');
  }

  ok('sem erros de página', !errs.length, errs.slice(0, 3).join(' | ') || 'nenhum');
  const modErr = await page.evaluate(() => JSON.stringify(G.modErr || {}));
  ok('sem erros de módulo', modErr === '{}' || modErr === '[]', modErr);
  console.log(fails.length ? `PODERES: ${fails.length} falha(s): ${fails.join(', ')}` : 'PODERES: ok');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
