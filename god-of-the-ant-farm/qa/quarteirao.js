// quarteirao: node qa/quarteirao.js [mundo] — o quarteirão da metrópole (L-077), provocado de propósito num mundo pronto: o
// primeiro da lista — a «megalópole» (worlds/mega.js), a «metrópole», os anos100, a guerra mundial, os anos500 e os 1000 —
// onde uma cidade de nível 4 ou 5 tem hoje lugar para um quarteirão no centro (ou o mundo pedido): essa cidade vive anos
// abençoados com pedra de sobra, e cada quarteirão que o planejador põe é fiscalizado na hora:
// 1 vai para terra cara o bastante (a de uma ínsula) e continua quarteirão; derruba só casas baixas, sobrados, hortas e
//   campos da própria cidade — nunca um prédio público, nunca as duas últimas fazendas nem o último campo de um tipo —
//   e traz mais camas do que tira;
// 2 quem morava nas casas derrubadas fica sem casa, mas as moedas da cidade não somem (vão no bolso do mais velho);
// 3 o verificador todo ano (o anel de passagem em volta de cada quarteirão fica livre);
// 4 um save no meio de uma obra: a obra volta igual;
// 5 um desalojado morre no meio, e o raio do deus cai na obra: o verificador não acha nada;
// 6 os anos passam: quarteirões prontos e morados;
// 7 o centro calçado (L-602: as células caras de Mênfis eram meio rua calçada, e o lote não podia ter um palmo de rua):
//   7a cada quarteirão que o planejador põe sobre rua nunca toma a estrada, e o anel em volta religa as ruas que ele corta;
//   7b de propósito: o melhor lote de hoje, julgado sozinho pela regra do jogo (V.blockLot) com o sorteio parado, vale com uma
//      rua calçada deitada através dele, de anel a anel (antes, nenhum lote de quarteirão tomava rua de pedra); a mesma rua feita
//      estrada, não; e com uma ponta da rua murada no anel (a rua cortada sem volta), não.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const KEYS = process.argv[2] ? [process.argv[2]] : ['mega', 'metropole', 'anos100', 'mundial', 'anos500', 'anos1000'];
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] });
  const page = await browser.newPage({ viewport: { width: 1000, height: 700 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message + ' ' + (e.stack || '').split('\n').slice(0, 3).join(' | ')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' });
  // (the world: the first of the list where a town of level 4 or 5 has room in its heart for a block today, by the game's own
  // rule — V.blockSite —; where none has, the first, and its biggest town lives blessed years until it has. In the mega of
  // the generation 14 none of its three had: their hearts all streets, insulae and public works, the only lots left holding
  // a town's last apiary or last orchard, which a block never takes, with no room in the town for another one; and twelve
  // blessed years opened none, T-467)
  let key = null;
  for (const k of KEYS) {
    await page.addScriptTag({ path: path.join(ROOT, 'worlds', k + '.js') });
    const room = await page.evaluate(k => {
      G.Save.apply(JSON.parse(G.Ready.data[k])); const S = G.S, V = G.Village;
      return [...S.settlements.values()].some(s => { if ((s.tier || 0) < 4) return false; s._noSite = {}; const p = V.blockSite(s); s._noSite = {}; return !!p; });
    }, k);
    if (room) { key = k; break; }
  }
  if (!key) key = KEYS[0];
  console.log(`  o mundo: ${key}`);
  const fails = []; const ok = (name, cond, info) => { console.log(`${cond ? 'PASSOU' : 'FALHOU'} | ${name} | ${info}`); if (!cond) fails.push(name); };
  // the town, and the watch on every block the planner places
  const town = await page.evaluate(key => {
    G.Save.apply(JSON.parse(G.Ready.data[key])); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
    const S = G.S, V = G.Village;
    // (the biggest town of level 4 or 5 whose heart has room for a block today, else the biggest: in the mega of the v37 the
    // biggest, Hedeby, had none in twelve blessed years — its heart all insulae, temples, workshops and streets —, T-195)
    const big = [...S.settlements.values()].filter(s => (s.tier || 0) >= 4).sort((a, b) => V.pop(b.id) - V.pop(a.id));
    const set = big.find(s => { s._noSite = {}; const p = V.blockSite(s); s._noSite = {}; return !!p; }) || big[0];
    if (!set) return null;
    const f = G.Fac.get(set.fac); if (!G.Civ.has(f.id, 'engenharia')) G.Civ.learn(f, 'engenharia', 'teste');
    const W = window.__Q = { set: set.id, log: [], bad: [], homeless: 0, people: [], blocks: 0, street: 0, sbad: [] };
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
      // (the streets under the lot: the minor ones it may take, the highway never — and the ring joins again what it cuts, L-602)
      let streets = 0, high = 0;
      for (let ty = b.y; ty < b.y + b.h; ty++) for (let tx = b.x; tx < b.x + b.w; tx++) { const i = ty * G.N + tx; if (S.road[i] >= 3) high++; else if (S.road[i] || (G.City && G.City.onStreet(set, i))) streets++; }
      if (high) W.sbad.push(`quarteirão em ${b.x},${b.y} sobre ${high} casas da estrada`);
      if (streets) { W.street++; if (!V.relinks(set, b.x, b.y, b.w, gone.map(o => o.id))) W.sbad.push(`quarteirão em ${b.x},${b.y}: o anel não religa as ${streets} casas de rua que ele corta`); }
      W.log.push(`ano ${S.day}: terra ${val}, derrubou ${gone.map(o => o.type).join(', ') || 'nada'}${streets ? `, ${streets} casas de rua` : ''}`);
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
    // ---- 7b, first — on the world as chosen, the town with room for a block today; all it lays down is taken up again —: the
    // paved heart, on purpose (L-602): the town's best lot for a block today, judged alone by the game's own rule
    // (V.blockLot, the search on one lot), with the world's draw held still: as it is; with a paved street laid across it from a
    // tile of the ring to the other (a street of stone, which no lot of a block could take before); the same street a highway; and
    // the street's end on the ring walled — the street cut with no way round
    const g = await page.evaluate(() => {
      const S = G.S, V = G.Village, W = G.W, N = G.N, Q = __Q; const set = S.settlements.get(Q.set);
      const R0 = G.R, rng0 = S.rng; G.R = () => 0.5;
      const at = p => (p ? p[0] + ',' + p[1] : 'recusado');
      const road0 = new Map(); const paint = (tiles, r) => { for (const i of tiles) { if (!road0.has(i)) road0.set(i, S.road[i]); S.road[i] = r; } };
      let wallAt = -1, wall0 = 0; const out = {};
      // (asked as the planner asks, inside the world's step: from outside it, in a world just opened, the land answers neutral —
      // the town has no look yet and a question from a screen makes none, L-760 —, and no lot of the heart is dear: T-847)
      G.inSim++;
      try {
        set._noSite = {}; const A = V.blockSite(set); set._noSite = {}; if (!A) return { none: 'nenhum lote de quarteirão hoje' };
        const judge = () => at(V.blockLot(set, A[0], A[1])); out.a = A[0] + ',' + A[1]; out.alone = judge();
        const gone = A.demolish || [];
        // (a street across the lot, from a tile of the ring to the other: a row or a column whose two ends are free tiles one walks,
        // and that the ring joins again)
        const ways = [];
        for (const y of [A[1], A[1] + 1]) ways.push([y * N + A[0] - 1, y * N + A[0], y * N + A[0] + 1, y * N + A[0] + 2]);
        for (const x of [A[0], A[0] + 1]) ways.push([(A[1] - 1) * N + x, A[1] * N + x, (A[1] + 1) * N + x, (A[1] + 2) * N + x]);
        let way = null;
        for (const t of ways) {
          const [e1, , , e2] = t; if (S.occ[e1] || S.occ[e2] || !W.walkable(e1) || !W.walkable(e2) || S.road[e1] >= 3 || S.road[e2] >= 3) continue;
          paint(t, 2); const ok = V.relinks(set, A[0], A[1], 2, gone); for (const i of t) S.road[i] = road0.get(i); road0.clear();
          if (ok) { way = t; break; }
        }
        if (!way) return { none: `o lote ${out.a} não tem rua possível de anel a anel` };
        out.way = way.map(i => (i % N) + ',' + ((i / N) | 0)).join(' ');
        paint(way, 2); out.paved = judge();
        paint(way, 3); out.high = judge();
        paint(way, 2); wallAt = way[0]; wall0 = S.wall[wallAt]; S.wall[wallAt] = 1; W.touchWalk(); out.walled = judge();
      } finally {
        if (wallAt >= 0) { S.wall[wallAt] = wall0; W.touchWalk(); }
        for (const [i, r] of road0) S.road[i] = r;
        G.R = R0; S.rng = rng0; set._noSite = {}; G.inSim--;
      }
      return out;
    });
    if (g.none) ok('7b de propósito: a rua calçada sim, a estrada e a rua sem volta não (L-602)', false, g.none);
    else ok('7b de propósito: a rua calçada sim, a estrada e a rua sem volta não (L-602)', g.alone === g.a && g.paved === g.a && g.high === 'recusado' && g.walled === 'recusado',
      `o melhor lote ${g.a} (sozinho: ${g.alone}); com uma rua calçada de anel a anel (${g.way}): ${g.paved}; feita estrada: ${g.high}; com a ponta murada: ${g.walled}`);
    // ---- the bad case on purpose: a family, with its savings, lives where the next block will stand
    // (a place wholly under a field has no ground for the house: that block goes up as it is; and a heart with no room
    // for a block today lives a blessed year more — at most twelve — until there is)
    const p0 = await page.evaluate(() => {
      const S = G.S, V = G.Village, W = __Q; const set = S.settlements.get(W.set); const d0 = S.day;
      const FIELD = { farm: 1, horta: 1, pomar: 1, plantacao: 1, vinhedo: 1, apiario: 1 }; // (what a block brings down that is no house)
      const feed = () => { const f = G.Fac.get(set.fac); if (f) { f.stock.stone = Math.max(f.stock.stone, 200); f.stock.wood = Math.max(f.stock.wood, 120); } };
      const year = () => { G.Skip.on = true; S.blessed = true; try { const d = S.day; while (S.day === d) { G.Main.skipStep(1); S.divinePeace = Math.max(S.divinePeace || 0, 100); S.weather.fertility = Math.max(S.weather.fertility || 0, 100); } } finally { G.Skip.on = false; S.blessed = false; } feed(); };
      feed();
      let pos = null, gone = [], house = null, fam = 0, lived = false, tries = 0;
      while (!house && !lived && S.day < d0 + 12 && tries < 40) {
        tries++; set._noSite = {}; pos = V.blockSite(set);
        if (!pos) { year(); continue; }
        gone = pos.demolish || []; lived = gone.some(id => [...S.villagers.values()].some(v => v.home === id));
        if (lived) break;
        for (let ty = pos[1]; ty < pos[1] + 2 && !house; ty++) for (let tx = pos[0]; tx < pos[0] + 2 && !house; tx++) if (!S.occ[ty * G.N + tx]) house = V.addBuilding('house', tx, ty, set.id, true);
        // (no ground free under the block — a heart all built, in the mega of the v37 for twelve years —: a house it would bring
        // down that nobody lives in takes the family; or, where it brings down only gardens and fields, the family's house
        // stands on a tile of the block's lot one of them held, the field taken up by the test's hand — T-195. The first site
        // of Mênfis since the junction 841a188 is a farm of 3 that covers the whole lot, and the next one waits on where the
        // towns round it build: the test's own hand makes the premise, not the course of the world, T-427)
        if (!house) { const e = gone.map(id => S.buildings.get(id)).find(o => o && G.BDEF[o.type].housing); if (e) house = e; }
        if (!house) {
          const o = gone.map(id => S.buildings.get(id)).find(q => q && FIELD[q.type] && q.set === set.id);
          if (o) {
            const [ox, oy, ow, oh] = [o.x, o.y, o.w, o.h]; V.removeBuilding(o); gone = gone.filter(id => id !== o.id);
            for (let ty = pos[1]; ty < pos[1] + 2 && !house; ty++) for (let tx = pos[0]; tx < pos[0] + 2 && !house; tx++) if (!S.occ[ty * G.N + tx] && tx >= ox && tx < ox + ow && ty >= oy && ty < oy + oh) house = V.addBuilding('house', tx, ty, set.id, true);
          }
        }
        if (!house) V.startProject(set, 'quarteirao', pos);
      }
      if (!house && !lived) return { none: `nenhum lugar de quarteirão com chão livre para a casa em ${S.day - d0} anos` };
      if (house) {
        // (a couple of the town, both of it: in Tenochtitlan of the metrópole the first one found had its partner in another
        // town, and the family was one)
        const cand = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 25 && !v.captive && !v.jail && !v.aboard && v.partner && S.villagers.get(v.partner));
        const head = cand.find(v => { const p = S.villagers.get(v.partner); return p.set === set.id && !p.captive && !p.jail && !p.aboard; }) || cand[0];
        for (const v of [head, S.villagers.get(head.partner), ...(head.kids || []).map(id => S.villagers.get(id))]) if (v && v.set === set.id && (v === head || v.age < 16 || v.id === head.partner)) { v.home = house.id; fam++; }
        house.coin = 30;
      }
      const b = V.startProject(set, 'quarteirao', house ? Object.assign([pos[0], pos[1]], { demolish: gone.includes(house.id) ? gone : gone.concat([house.id]) }) : pos);
      return { site: b && b.type === 'quarteirao' ? b.id : 0, fam, at: `${pos[0]},${pos[1]}`, waited: S.day - d0 };
    });
    if (p0.waited) console.log(`  (${p0.waited} anos abençoados até o centro ter lugar para o quarteirão da família)`);
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
        return { day: S.day, viol, mods: Object.keys(G.modErr || {}).length, log: W.log, wbad: W.bad, homeless: W.homeless, blocks: W.blocks, street: W.street, sbad: W.sbad };
      });
      console.log(`  ${town}: família de ${p0.fam} no lugar ${p0.at}; ${a.blocks} quarteirões até o ano ${a.day}: ${a.log.join(' | ')}`);
      const rule = a.wbad.filter(x => !/moedas|ainda mora/.test(x)), home = a.wbad.filter(x => /moedas|ainda mora/.test(x));
      ok('1 cada quarteirão em terra cara, derrubando só o que pode', a.blocks >= 1 && !rule.length, `${a.blocks} quarteirões${rule.length ? '; ' + rule.slice(0, 4).join(' | ') : ''}`);
      ok('2 os desalojados sem casa, as moedas guardadas', a.homeless > 0 && !home.length, `${a.homeless} desalojados${home.slice(0, 3).map(x => '; ' + x).join('')}`);
      ok('3 o verificador todo ano (o anel dos quarteirões livre)', !a.viol.length && !a.mods, `até o ano ${a.day}${a.viol.length ? '; ' + a.viol.slice(0, 3).join(' | ') : ': nada'}${a.mods ? '; erro de módulo' : ''}`);
      ok('5 um desalojado morre, um raio cai na obra', s.fire === true && s.died && !a.viol.length && !a.mods, `raio ${s.fire}, morte ${s.died}`);
      ok('7a cada quarteirão posto sobre rua: nunca a estrada, e o anel religa (L-602)', !a.sbad.length, `${a.street} de ${a.blocks} quarteirões sobre rua${a.sbad.length ? '; ' + a.sbad.slice(0, 3).join(' | ') : ''}`);
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
