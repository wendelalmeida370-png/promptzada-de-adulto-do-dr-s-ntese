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
// Inverno Súbito
//  i1 as águas fundas congelam e viram caminho: alguém anda até o meio do gelo; as plantações morrem
//  i2 um save no meio do inverno carregado duas vezes (o gelo volta igual)
//  i3 o deus ergue terra debaixo do gelo; no degelo, quem está no gelo cai na água gelada e sai na margem
// Dragão
//  g1 o dragão faz o covil e ataca a maior cidade: rasantes de fogo, o povo foge, arqueiros acertam; o ouro que leva é o que a cidade perde
//  g2 um save no meio do rasante carregado duas vezes: o mesmo futuro
//  g3 enquanto dorme, os bravos sobem ao covil; um morre no meio da luta; o dragão morre: o Matador de Dragões, os ossos, o tesouro no chão
//  g4 raio e meteoro em pleno voo; o covil afunda no mar (outro covil); ele parte levando o tesouro; um save com um dragão quebrado
// Abrir o Mar (no mundo pronto «metrópole», o estreito entre duas cidades)
//  p1 o mar se abre: o fundo vira chão pisável e as duas cidades se alcançam a pé; o povo desce para catar peixes; alguém atravessa
//  p2 um save com o mar aberto carregado duas vezes: o fundo seco volta igual, o mesmo futuro
//  p3 o fim: as paredes tremem, quem está lá embaixo corre; quem não sai é levado; depois, nada de fundo seco e as cidades separadas
//  p4 um navio no caminho quando o mar se abre; o deus ergue terra no meio do fundo; um save com um mar aberto quebrado
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
  await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'metropole.js') }); // (two great towns across a strait, for the parted sea)
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

  // ------------------------------ Inverno Súbito ------------------------------
  await page.evaluate(() => {
    // deep water close to a town: the place for a winter (the middle of it, and someone who will walk out onto the ice)
    __H.lake = () => {
      const S = G.S, T = G.T, N = G.N; let best = null, bn = 0;
      for (const set of S.settlements.values()) {
        const pts = []; for (let y = Math.floor(set.cy - 12); y <= set.cy + 12; y++) for (let x = Math.floor(set.cx - 12); x <= set.cx + 12; x++) { if (!G.W.inb(x, y)) continue; const i = y * N + x; if (S.type[i] === T.RIVER && S.deep[i] && !S.road[i]) pts.push([x + 0.5, y + 0.5, i]); }
        if (pts.length > bn) { bn = pts.length; best = { set, pts }; }
      }
      if (!best || bn < 6) return null;
      const cx = best.pts.reduce((a, p) => a + p[0], 0) / bn, cy = best.pts.reduce((a, p) => a + p[1], 0) / bn;
      const mid = best.pts.slice().sort((a, b) => G.dist2(a[0], a[1], cx, cy) - G.dist2(b[0], b[1], cx, cy))[0];
      return { set: best.set, x: mid[0], y: mid[1], i: mid[2], n: bn };
    };
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; H.toDay();
      const L = H.lake(); if (!L) return null;
      const walk0 = G.W.walkable(L.i);
      const v = [...S.villagers.values()].filter(o => o.set === L.set.id && o.age >= 16 && !o.inside && !o.aboard && !o.captive && !o.jail).sort((a, b) => G.dist2(a.x, a.y, L.x, L.y) - G.dist2(b.x, b.y, L.x, L.y))[0];
      const reach0 = v ? G.W.reaches(v, L.x, L.y) : null;
      const crops0 = [...S.buildings.values()].filter(b => b.type === 'farm' && b.crops && G.dist(b.x, b.y, L.x, L.y) < 8).reduce((a, b) => a + b.crops.filter(c => c.s > 0).length, 0);
      const ok = G.Powers.cast('winter', L.x, L.y); const w = S.winters && S.winters[0];
      const walk1 = G.W.walkable(L.i); const reach1 = v ? G.W.reaches(v, L.x, L.y) : null;
      let got = false;
      if (v) { G.Vg.H.setTask(v, { type: 'olhar', x: L.x, y: L.y, fx: L.x + 1, fy: L.y, pri: 3, until: S.clock + 150, what: 'gelo', kind: 'olhar' }); H.run(40); got = G.dist(v.x, v.y, L.x, L.y) < 1.2 && !!(S.ice && S.ice[G.W.idx(v.x, v.y)]); }
      return { ok, set: L.set.name, deep: L.n, frozen: w ? w.tiles.length : 0, walk0, walk1, reach0, reach1, who: v && v.name, got, crops0, dead: w ? w.crops : 0, qa: H.qa() };
    });
    if (!r) ok('i1 inverno súbito', false, 'nenhuma água funda perto de uma cidade neste mundo');
    else ok('i1 o gelo vira caminho', r.ok && r.frozen > 0 && !r.walk0 && r.walk1 && r.reach1 && r.got && !r.qa.length, `${r.set}: ${r.frozen} de ${r.deep} casas de água funda congelaram; pisável ${r.walk0} → ${r.walk1}; ${r.who} alcança o meio ${r.reach0} → ${r.reach1} e andou até lá ${r.got}; plantações mortas ${r.dead} de ${r.crops0}; ${r.qa.slice(0, 3).map(e => e.msg).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; H.toDay();
      const L = H.lake(); if (!L) return null;
      G.Powers.cast('winter', L.x, L.y); H.run(5);
      const save = G.Save.serialize(); const n = S.winters[0].tiles.length;
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0);
      const n1 = G.S.ice ? G.S.ice.reduce((a, b) => a + b, 0) : 0; const walk = G.W.walkable(L.i);
      H.run(20); const a = H.digest(L.x, L.y) + JSON.stringify(G.S.winters);
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(20); const b = H.digest(L.x, L.y) + JSON.stringify(G.S.winters);
      let k = 0; while (k < a.length && a[k] === b[k]) k++;
      return { n, n1, walk, same: a === b, at: k, ctx: a.slice(Math.max(0, k - 60), k + 60) + ' ≠ ' + b.slice(Math.max(0, k - 60), k + 60), qa: H.qa() };
    });
    if (r) ok('i2 save no meio do inverno: o gelo volta igual, o mesmo futuro', r.same && r.n1 === r.n && r.walk && !r.qa.length, r.same ? `${r.n} casas de gelo no save, ${r.n1} depois de carregar; pisável ${r.walk}; futuro idêntico` : `diferem no caractere ${r.at}: ${r.ctx}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; H.toDay();
      const L = H.lake(); if (!L) return null;
      G.Powers.cast('winter', L.x, L.y); const w = S.winters[0];
      // the god raises land under one edge of the ice
      const edge = w.tiles[w.tiles.length - 1]; const ex = edge % G.N + 0.5, ey = ((edge / G.N) | 0) + 0.5;
      G.Powers.raise(ex, ey); H.run(1);
      const after = w.tiles.length;
      // someone walks to the middle of the ice and stays there, watching, until the thaw
      const v = [...S.villagers.values()].filter(o => o.set === L.set.id && o.age >= 16 && !o.inside && !o.aboard && !o.captive && !o.jail).sort((a, b) => G.dist2(a.x, a.y, L.x, L.y) - G.dist2(b.x, b.y, L.x, L.y))[0];
      const mid = w.tiles.slice().sort((a, b) => G.dist2(a % G.N, (a / G.N) | 0, L.x, L.y) - G.dist2(b % G.N, (b / G.N) | 0, L.x, L.y))[0];
      const mx = mid % G.N + 0.5, my = ((mid / G.N) | 0) + 0.5;
      let onIce = false; const bad = [];
      // (the day goes by; near the end of it, out onto the ice)
      H.until(() => { const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(q => q.msg)); return w.t > G.DAY_LEN - 30; }, G.DAY_LEN);
      G.Vg.H.setTask(v, { type: 'olhar', x: mx, y: my, fx: mx + 1, fy: my, pri: 3, until: S.clock + 100, what: 'gelo', kind: 'olhar' });
      H.until(() => { if (S.ice && S.ice[G.W.idx(v.x, v.y)] && w.t > G.DAY_LEN - 2) onIce = true; return !(S.winters || []).length; }, 60);
      H.run(2);
      const alive = S.villagers.get(v.id); const i = alive ? G.W.idx(alive.x, alive.y) : -1;
      const wet = [...S.villagers.values()].filter(o => !o.aboard && !o.inside && S.type[G.W.idx(o.x, o.y)] === G.T.RIVER && S.deep[G.W.idx(o.x, o.y)] && !S.road[G.W.idx(o.x, o.y)] && !(o.task && o.task.type === 'swim')).length;
      const iceLeft = S.ice ? S.ice.reduce((a, b) => a + b, 0) : 0;
      return { before: w.tiles.length, after, onIce, fell: w.fell, who: v.name, alive: !!alive, dry: alive ? G.W.walkable(i) : null, bio: alive ? (alive.bio || []).some(e => /água gelada/.test(e[2] || '')) : null, wet, iceLeft, bad, qa: H.qa() };
    });
    if (r) ok('i3 terra erguida sob o gelo; no degelo, quem está no gelo cai na água', r.onIce && r.fell >= 1 && (!r.alive || (r.dry && r.bio)) && !r.wet && !r.iceLeft && !r.bad.length && !r.qa.length, `gelo depois da terra erguida: ${r.after} casas; ${r.who} no gelo ${r.onIce}; caíram ${r.fell}; ${r.who} ${r.alive ? `vivo, em terra seca ${r.dry}, biografia ${r.bio}` : 'morreu na água'}; gente em água funda ${r.wet}; gelo restante ${r.iceLeft}; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }

  // ------------------------------ Dragão ------------------------------
  await page.evaluate(() => {
    // (a fire dragon over the biggest town, a purse in each of its houses, coins in the people's hands)
    __H.dragon = () => {
      const S = G.S; const set = __H.town(); const f = G.Fac.get(set.fac); if (!G.Eco.coinage(f.id)) G.Civ.learn(f, 'moeda', 'teste');
      for (const b of S.buildings.values()) if (b.set === set.id && b.built && G.BDEF[b.type].housing) b.coin = (b.coin || 0) + 20;
      const ok = G.Powers.cast('dragon', set.cx + 6, set.cy + 6); const d = S.dragons[S.dragons.length - 1]; d.hue = 0;
      return { ok, d, set, f };
    };
    __H.dragonDigest = () => { const S = G.S; return JSON.stringify(S.dragons) + '|' + S.rng + '|' + [...S.villagers.values()].map(v => `${v.id}:${v.x.toFixed(2)},${v.y.toFixed(2)}:${v.hp.toFixed(1)}:${v.task ? v.task.type : '-'}`).join(';') + '|' + G.Nature.fireSet.size; };
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; const { ok, d, set, f } = H.dragon();
      const li = G.W.idx(d.lx, d.ly); const lairOk = G.W.walkable(li) && S.type[li] >= G.T.SAND && S.type[li] !== G.T.RIVER;
      // (the town it robs is the one it last flew over: the one the god pointed at)
      const sum = () => { const t = S.settlements.get(d.set); const ff = t && G.Fac.get(t.fac); let n = ff ? ff.stock.moedas || 0 : 0; for (const b of S.buildings.values()) if (t && b.set === t.id && G.BDEF[b.type].housing) n += b.coin || 0; return n; };
      let flee = 0, fires = 0, rob = null, k = 0; const bad = [];
      while (d.st !== 'dorme' && k++ < 4000) {
        const st0 = d.st; const before = st0 === 'rouba' ? sum() : 0; const took0 = d.took;
        G.debug.step(0.05);
        // (the gold the town loses in the moment of the claws is the gold in its hoard: none made, none lost)
        if (st0 === 'rouba' && d.st !== 'rouba') rob = { gone: Math.round((before - sum()) * 100) / 100, took: Math.round((d.took - took0) * 100) / 100 };
        if (k % 10 === 0) { flee = Math.max(flee, H.tasks('flee').filter(v => v.task.why === 'dragon').length); fires = Math.max(fires, G.Nature.fireSet.size); }
        if (k % 100 === 0) { const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); }
      }
      return { ok, lairOk, name: d.name, set: (S.settlements.get(d.set) || set).name, aimed: d.set === set.id, st: d.st, passes: d.passes, burned: d.burned, killed: d.killed, hp: Math.round(d.hp), flee, fires, rob, hoard: d.hoard, log: S.history.some(e => e.txt.includes(d.name) && /desceu das nuvens/.test(e.txt)), legend: !!(S.lore && S.lore.legends.some(l => l.key === 'dragon:' + d.id)), bad, qa: H.qa() };
    });
    ok('g1 o dragão ataca: rasantes de fogo, o povo foge, as flechas acertam', r.ok && r.lairOk && r.aimed && r.st === 'dorme' && r.passes >= 3 && r.burned > 0 && r.fires > 0 && r.flee > 0 && r.hp < 520 && r.log && r.legend, `${r.name} sobre ${r.set} (a cidade apontada: ${r.aimed}): ${r.passes} rasantes, ${r.burned} lugares em chamas (até ${r.fires} focos), ${r.flee} fugindo, ${r.killed} mortos; vida 520 → ${r.hp}; covil em terra firme ${r.lairOk}; crônica ${r.log}, lenda ${r.legend}; agora: ${r.st}`);
    ok('g1 o ouro levado: o que a cidade perde é o que vai para o tesouro', r.rob && r.rob.took > 0 && Math.abs(r.rob.gone - r.rob.took) < 0.05 && Math.abs(r.hoard - r.rob.took) < 0.05, r.rob ? `a cidade perdeu ${r.rob.gone} moedas, o dragão levou ${r.rob.took}; tesouro ${r.hoard}` : 'não roubou');
    ok('g1 verificador', !r.bad.length && !r.qa.length, [...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'limpo');
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; const { d } = H.dragon();
      let k = 0; while (d.st !== 'passe' && k++ < 3000) G.debug.step(0.05); for (let j = 0; j < 12; j++) G.debug.step(0.05);
      const mid = d.st + (d.breath ? ' cuspindo fogo' : '');
      const save = G.Save.serialize();
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(40); const a = H.dragonDigest(); const st = (G.S.dragons[0] || {}).st;
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(40); const b = H.dragonDigest();
      let j = 0; while (j < a.length && a[j] === b[j]) j++;
      return { same: a === b, mid, st, len: a.length, at: j, ctx: a.slice(Math.max(0, j - 60), j + 60) + ' ≠ ' + b.slice(Math.max(0, j - 60), j + 60), qa: H.qa() };
    });
    ok('g2 save no meio do rasante: o mesmo futuro', r.same && !r.qa.length, r.same ? `salvo em «${r.mid}»; depois de carregar, 40 s depois: ${r.st}; futuro idêntico (${r.len} caracteres)` : `diferem no caractere ${r.at}: ${r.ctx}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; const { d } = H.dragon();
      d.hoard = 60; // (what it took from the towns before)
      H.until(() => d.st === 'dorme', 400); H.toDay();
      // (asleep in daylight: the brave of the burned town climb to the lair; one of them falls in the fight)
      let fighting = 0, fell = null; const bad = []; const climbed = new Set();
      let woke = false;
      H.until(() => { const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); const t = H.tasks('dragao'); for (const v of t) climbed.add(v.id); fighting = t.filter(v => v.task.st === 2).length; if (d.st === 'luta') woke = true; if (!fell && fighting >= 1 && d.st === 'luta') { const v = t.find(o => o.task.st === 2); fell = v.name; G.Village.kill(v, 'teste', true); } return !!fell; }, 160);
      d.fled = 1; d.hp = Math.min(d.hp, 40); // (the blows have told: the next ones kill — and it does not get away)
      // (the spill is caught in the step it happens, before anyone picks a coin)
      let rn = null, spill = 0;
      const t0 = H.until(() => { for (const v of H.tasks('dragao')) climbed.add(v.id); const q = S.gifts && S.gifts.rains.find(o => o.from === d.name); if (q && !rn) { rn = q; spill = Math.round((q.street + q.lost) * 100) / 100; } return !S.dragons.includes(d); }, 150);
      const slayer = [...S.villagers.values(), ...S.dead.values()].find(v => v.ep === 'matadragao');
      H.run(60);
      const left = rn ? S.gifts.piles.filter(q => q.rain === rn.id).reduce((a, q) => a + q.n, 0) : 0;
      const sent = climbed.size;
      return { sent, fell, woke, dead: !S.dragons.includes(d), t0, hoard: d.spilt, slayer: slayer ? slayer.name + ' ' + G.Politics.epithet(slayer) : null, bio: !!(slayer && (slayer.bio || []).some(e => /Matou/.test(e[2] || ''))), bones: (S.dragonBones || []).length, spill, picked: rn ? Math.round(rn.n * 100) / 100 : 0, left: Math.round(left * 100) / 100, sunk: rn ? rn.sunk : 0, stray: H.tasks('dragao').length, log: S.history.some(e => /matou .*! /.test(e.txt) && e.txt.includes(d.name)), bad, qa: H.qa() };
    });
    ok('g3 os bravos sobem ao covil, um cai na luta, o dragão morre: o Matador de Dragões', r.sent >= 2 && r.fell && r.woke && r.dead && r.slayer && r.bio && r.bones >= 1 && r.log && !r.stray, `${r.sent} subiram; ${r.fell} morreu no meio da luta; o dragão acordou ${r.woke}; morto ${r.dead} (${r.t0} s); ${r.slayer || 'sem matador'}, biografia ${r.bio}; ${r.bones} esqueleto(s); ninguém mais subindo: ${!r.stray}`);
    ok('g3 o tesouro se esparrama: toda moeda contada', r.hoard >= 60 && Math.abs(r.spill - r.hoard) < 0.01 && r.picked + r.left + r.sunk > 0 && !r.bad.length && !r.qa.length, `${r.hoard} moedas no tesouro (60 de antes e o que levou agora) → ${r.spill} no chão; ${r.picked} catadas, ${r.left} ainda no chão, ${r.sunk} perdidas; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh(); const S = G.S; const W = G.W, T = G.T; const bad = []; const chk = () => { const e = H.qa(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); };
      // the god's own hand: a lightning bolt in flight, the impact of a meteor, a last bolt — it falls from the sky
      const a = H.dragon().d; let k = 0; while (a.st !== 'passe' && k++ < 3000) G.debug.step(0.05);
      const hp0 = a.hp; G.Powers.lightning(a.x, a.y); const bolt = Math.round(hp0 - a.hp);
      G.Powers.meteorImpact({ x: a.x, y: a.y, r: 3.4 }); G.Powers.lightning(a.x, a.y);
      const falling = a.st === 'morre' || a.hp <= 0; H.until(() => !S.dragons.includes(a), 20); chk();
      const godKill = S.history.some(e => /O céu matou/.test(e.txt) && e.txt.includes(a.name));
      // the ground under its lair sinks into the sea: it finds another
      const b = H.dragon().d; H.until(() => b.st === 'dorme', 400); const l0 = [b.lx, b.ly];
      G.Powers.sink(b.lx, b.ly); H.run(2);
      const moved = b.lx !== l0[0] || b.ly !== l0[1]; H.until(() => b.st === 'dorme', 120); chk();
      const li = W.idx(b.lx, b.ly); const newLair = b.st === 'dorme' && S.type[li] >= T.SAND && S.type[li] !== T.RIVER;
      // it has had enough: it flies away with the treasure
      b.hoard = 25; b.sorties = 3; b.wake = S.clock; H.run(1); const leaving = b.st === 'parte';
      H.until(() => !S.dragons.includes(b), 80); chk();
      const gone = !S.dragons.includes(b) && S.history.some(e => /além do horizonte/.test(e.txt) && e.txt.includes(b.name) && /25 moedas/.test(e.txt));
      // a damaged save: the broken dragon is dropped, the world loads
      const c = H.dragon().d; H.run(3); const o = JSON.parse(G.Save.serialize()); o.dragons.push({ id: 999999, x: NaN, y: 3, st: 'voa' }); o.dragons.push(null);
      let loaded = true; try { G.Save.apply(o); G.Main.mode = 'game'; G.UI.setSpeed(0); } catch (e) { loaded = false; }
      const kept = loaded ? G.S.dragons.map(q => q.id) : [];
      H.run(5); chk();
      return { bolt, falling, godKill, bones: (S.dragonBones || []).length, moved, newLair, leaving, gone, loaded, kept: kept.length === 1 && kept[0] === c.id, bad, qa: H.qa() };
    });
    ok('g4 a mão do deus: raio e meteoro derrubam o dragão em pleno voo', r.bolt >= 200 && r.falling && r.godKill && r.bones >= 1, `o raio tirou ${r.bolt} de vida; caindo ${r.falling}; crônica ${r.godKill}; ${r.bones} esqueleto(s)`);
    ok('g4 o covil afunda no mar: outro covil; depois parte levando o tesouro', r.moved && r.newLair && r.leaving && r.gone, `covil mudou ${r.moved}, novo covil em terra firme ${r.newLair}; partindo ${r.leaving}; sumiu com 25 moedas ${r.gone}`);
    ok('g4 save danificado: o dragão quebrado fica de fora, o mundo carrega', r.loaded && r.kept && !r.bad.length && !r.qa.length, `carregou ${r.loaded}, ficou só o dragão bom ${r.kept}; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }

  // ------------------------------ Abrir o Mar ------------------------------
  await page.evaluate(() => {
    // the strait: in the ready world «metrópole», the widest way the sea can open between two lands with a town on each side
    __H.strait = () => {
      const S = G.S, N = G.N; let best = null;
      for (let y = 2; y < N - 2; y++) for (let x = 2; x < N - 2; x++) {
        if (S.type[G.W.idx(x, y)] > G.T.SEA) continue;
        const w = G.Powers.seaWay(x + 0.5, y + 0.5); if (!w || !w.two) continue;
        const A = G.Village.nearSettlementName(w.a.x, w.a.y), B = G.Village.nearSettlementName(w.b.x, w.b.y);
        if (!A || !B || A === B) continue;
        if (!best || w.tiles.length > best.n) best = { x: x + 0.5, y: y + 0.5, n: w.tiles.length, A, B };
      }
      return best;
    };
    __H.qaSea = () => QA.check().filter(e => (e.sev <= 2 || (e.sev === 3 && e.sys === 'marAberto')) && !(__H.base && __H.base.has(__H.qkey(e))));
    __H.seaDigest = c => { const S = G.S; return JSON.stringify(S.parts) + '|' + S.rng + '|' + (S.dry ? S.dry.reduce((a, b) => a + b, 0) : 0) + '|' + [...S.villagers.values()].filter(v => G.dist(v.x, v.y, c.x, c.y) < 25).map(v => `${v.id}:${v.x.toFixed(2)},${v.y.toFixed(2)}:${v.task ? v.task.type : '-'}`).join(';'); };
    __H.setByName = n => [...G.S.settlements.values()].find(s => s.name === n);
  });
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh('metropole'); const S = G.S; const W = G.W;
      const c = H.strait(); if (!c) return { none: true };
      const A = H.setByName(c.A), B = H.setByName(c.B);
      const w0 = G.Powers.seaWay(c.x, c.y); const linked0 = W.canWalk(w0.a.x, w0.a.y, w0.b.x, w0.b.y);
      const ok = G.Powers.cast('seapart', c.x, c.y); const p = S.parts[0];
      H.run(4);
      const dry = p.tiles.every(i => S.dry[i] && W.walkable(i)); const linked = W.canWalk(p.ax, p.ay, p.bx, p.by);
      const shipOn = S.ships.some(s => p.tiles.includes(W.idx(s.x, s.y)));
      // someone of the town on one side walks across to the other
      const v = [...S.villagers.values()].filter(o => o.set === A.id && o.age >= 16 && !o.inside && !o.aboard && !o.captive && !(o.task && o.task.pri >= 3)).sort((a, b) => G.dist2(a.x, a.y, p.ax, p.ay) - G.dist2(b.x, b.y, p.ax, p.ay))[0];
      let walker = null, across = false;
      if (v) { walker = v.name; G.Vg.H.setTask(v, { type: 'olhar', x: p.bx, y: p.by, fx: p.bx + 1, fy: p.by, pri: 3, until: S.clock + 120, what: 'mar', kind: 'olhar' }); }
      let down = 0, onBed = 0; const bad = [];
      H.until(() => { down = Math.max(down, H.tasks('fundo').length); const set = new Set(p.tiles); onBed = Math.max(onBed, [...S.villagers.values()].filter(o => set.has(W.idx(o.x, o.y))).length); if (v && S.villagers.has(v.id) && G.dist(v.x, v.y, p.bx, p.by) < 2) across = true; const e = H.qaSea(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); return across && p.fished >= p.fish; }, 100);
      return { c, linked0, ok, tiles: p.tiles.length, dry, linked, shipOn, walker, across, down, onBed, fished: p.fished, fish: p.fish, log: S.history.some(e => /O mar se abriu/.test(e.txt)), bad, qa: H.qaSea() };
    });
    if (r.none) ok('p1 abrir o mar', false, 'nenhum estreito entre duas cidades no mundo pronto');
    else {
      ok('p1 o mar se abre entre duas terras: o fundo vira caminho', r.ok && r.dry && !r.linked0 && r.linked && !r.shipOn && r.log, `${r.c.A} ↔ ${r.c.B}: ${r.tiles} casas de fundo seco, pisáveis ${r.dry}; de uma margem se chega à outra a pé: antes ${r.linked0}, agora ${r.linked}; navio no fundo ${r.shipOn}`);
      ok('p1 o povo desce para catar peixes e atravessa a pé', r.down >= 2 && r.fished >= 1 && r.across, `até ${r.down} descendo, ${r.onBed} no fundo ao mesmo tempo; ${r.fished} de ${r.fish} cestos de peixe; ${r.walker} atravessou ${r.across}`);
      ok('p1 verificador', !r.bad.length && !r.qa.length, [...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'limpo');
    }
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh('metropole'); const S = G.S;
      const c = H.strait(); G.Powers.cast('seapart', c.x, c.y); H.run(20);
      const dry0 = S.dry.reduce((a, b) => a + b, 0);
      const save = G.Save.serialize();
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); const dry1 = G.S.dry ? G.S.dry.reduce((a, b) => a + b, 0) : 0; const walk = G.S.parts[0] && G.W.walkable(G.S.parts[0].tiles[0]);
      H.run(40); const a = H.seaDigest(c);
      G.Save.apply(JSON.parse(save)); G.Main.mode = 'game'; G.UI.setSpeed(0); H.run(40); const b = H.seaDigest(c);
      let j = 0; while (j < a.length && a[j] === b[j]) j++;
      return { dry0, dry1, walk, same: a === b, len: a.length, at: j, ctx: a.slice(Math.max(0, j - 60), j + 60) + ' ≠ ' + b.slice(Math.max(0, j - 60), j + 60), qa: H.qaSea() };
    });
    ok('p2 save com o mar aberto: o fundo volta igual, o mesmo futuro', r.same && r.dry0 === r.dry1 && r.walk && !r.qa.length, r.same ? `${r.dry0} casas secas no save, ${r.dry1} depois de carregar, pisável ${r.walk}; futuro idêntico (${r.len} caracteres)` : `diferem no caractere ${r.at}: ${r.ctx}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh('metropole'); const S = G.S; const W = G.W, T = G.T;
      const c = H.strait(); const A = H.setByName(c.A), B = H.setByName(c.B);
      G.Powers.cast('seapart', c.x, c.y); const p = S.parts[0];
      // (wait until the last moments: three people are down on the bed when the walls start to tremble)
      H.until(() => p.t > G.DAY_LEN * 0.75 - 14, 200);
      const mid = p.tiles[Math.floor(p.tiles.length / 2)]; const near = p.tiles.slice(0, 3);
      const ppl = [...S.villagers.values()].filter(o => o.age >= 16 && !o.inside && !o.aboard && !o.captive && !o.jail && (o.set === A.id || o.set === B.id)).slice(0, 3);
      ppl.forEach((o, k) => { const i = k === 0 ? mid : near[k]; G.Vg.endTask(o); o.x = (i % G.N) + 0.5; o.y = ((i / G.N) | 0) + 0.5; o.path = null; G.Vg.H.setTask(o, { type: 'olhar', x: o.x, y: o.y, fx: o.x + 1, fy: o.y, pri: 3, until: S.clock + 60, what: 'mar', kind: 'olhar' }); });
      let ran = 0; H.until(() => { ran = Math.max(ran, H.tasks('sair').length); return p.st === 'fecha'; }, 20);
      H.until(() => { ran = Math.max(ran, H.tasks('sair').length); return false; }, 3);
      // (the one in the middle is caught: the god holds him there for the last seconds)
      const held = ppl[0]; const hid = held.id;
      H.until(() => { const o = S.villagers.get(hid); if (o) { o.x = (mid % G.N) + 0.5; o.y = ((mid / G.N) | 0) + 0.5; o.path = null; } return !S.parts.includes(p); }, 20);
      H.run(2);
      const o = S.villagers.get(hid);
      const caught = !o || S.dead.has(hid) || (S.type[W.idx(o.x, o.y)] >= T.SAND);
      const wet = [...S.villagers.values()].filter(q => !q.aboard && S.type[W.idx(q.x, q.y)] <= T.SEA && !(q.task && q.task.type === 'swim')).length;
      const dryLeft = S.dry ? S.dry.reduce((a, b) => a + b, 0) : 0;
      return { ran, held: held.name, dead: !o, caught, wet, dryLeft, walk: W.walkable(mid), linked: W.canWalk(p.ax, p.ay, p.bx, p.by), log: S.history.some(e => /O mar se fechou/.test(e.txt) && (o ? new RegExp(o.name + '.*cuspid') : /não saiu a tempo|não saíram a tempo/).test(e.txt)), warn: S.history.some(e => /paredes do mar começaram a tremer/.test(e.txt)), qa: H.qaSea() };
    });
    ok('p3 o mar se fecha: quem está lá embaixo corre; quem não sai é levado', r.warn && r.ran >= 2 && r.caught && r.log && !r.wet && !r.dryLeft && !r.walk && !r.linked && !r.qa.length, `aviso ${r.warn}; ${r.ran} correram para a margem; ${r.held} ficou no meio: ${r.dead ? 'morreu afogado' : 'sobreviveu e foi cuspido na praia'}; crônica ${r.log}; gente na água sem nadar ${r.wet}; fundo seco restante ${r.dryLeft}; de uma margem ainda se chega à outra ${r.linked}; ${r.qa.map(e => e.msg).slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }
  {
    const r = await page.evaluate(() => {
      const H = __H; H.fresh('metropole'); const S = G.S; const W = G.W, T = G.T; const bad = []; const chk = () => { const e = H.qaSea(); if (e.length && bad.length < 3) bad.push(...e.map(x => x.msg)); };
      const c = H.strait(); const w = G.Powers.seaWay(c.x, c.y);
      // a ship lying in the way when the sea opens: it is pushed out to the water, never left on the sand
      const sh = S.ships.find(q => q.st === 'idle') || S.ships[0]; let shipMoved = null;
      if (sh) { const i = w.tiles[Math.floor(w.tiles.length / 2)]; sh.x = (i % G.N) + 0.5; sh.y = ((i / G.N) | 0) + 0.5; }
      G.Powers.cast('seapart', c.x, c.y); const p = S.parts[0]; H.run(4); chk();
      if (sh) shipMoved = S.ships.includes(sh) ? !p.tiles.includes(W.idx(sh.x, sh.y)) : 'afundou';
      // the god raises land in the middle of the bed: that tile is land now, not sea held back
      const i0 = p.tiles[Math.floor(p.tiles.length / 2)]; const n0 = p.tiles.length;
      G.Powers.raise((i0 % G.N) + 0.5, ((i0 / G.N) | 0) + 0.5); H.run(2); chk();
      const raised = p.tiles.length < n0 && p.tiles.every(i => S.type[i] <= T.SEA);
      // a damaged save: the broken parting is dropped, the world loads, and the sea stays as it was
      const o = JSON.parse(G.Save.serialize()); o.parts.push({ id: 1, st: 'aberto', t: NaN, tiles: [1, 2] }); o.parts.push(null); if (o.parts[0]) o.parts[0].tiles.push(-5, 'x', G.N * G.N + 10);
      let loaded = true; try { G.Save.apply(o); G.Main.mode = 'game'; G.UI.setSpeed(0); } catch (e) { loaded = false; }
      const kept = loaded && G.S.parts.length === 1 && G.S.parts[0].tiles.every(i => Number.isInteger(i) && i >= 0 && i < G.N * G.N);
      H.run(3); chk();
      return { ship: !!sh, shipMoved, raised, n0, n1: p.tiles.length, loaded, kept, bad, qa: H.qaSea() };
    });
    ok('p4 um navio no caminho é empurrado para a água; terra erguida no fundo deixa de ser fundo', (!r.ship || r.shipMoved === true || r.shipMoved === 'afundou') && r.raised, `navio ${r.ship ? (r.shipMoved === true ? 'empurrado para a água' : r.shipMoved) : 'nenhum no mundo'}; terra erguida: fundo ${r.n0} → ${r.n1} casas, todas ainda mar ${r.raised}`);
    ok('p4 save danificado: o mar aberto quebrado fica de fora, o mundo carrega', r.loaded && r.kept && !r.bad.length && !r.qa.length, `carregou ${r.loaded}, ficou só o mar aberto bom ${r.kept}; ${[...r.bad, ...r.qa.map(e => e.msg)].slice(0, 3).join(' | ') || 'verificador limpo'}`);
  }

  ok('sem erros de página', !errs.length, errs.slice(0, 3).join(' | ') || 'nenhum');
  const modErr = await page.evaluate(() => JSON.stringify(G.modErr || {}));
  ok('sem erros de módulo', modErr === '{}' || modErr === '[]', modErr);
  console.log(fails.length ? `PODERES: ${fails.length} falha(s): ${fails.join(', ')}` : 'PODERES: ok');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
