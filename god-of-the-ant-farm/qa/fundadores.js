// fundadores: node qa/fundadores.js [mundo] — quem uma cidade manda embora para sempre (L-440): os fundadores de uma vila nova
// (G.Village.pickFounders, a escolha do checkExpansion) e os colonos de um navio (G.Expe.colony, para onde o Naval.colonize
// das vilas leva) são só quem a cidade pode mandar (G.Vg.canSend), e uma família vai inteira. Antes, os fundadores eram quem
// estivesse à mão — o corpo do deus saía andando (e o deus era posto para fora dele), o preso saía da cela, o emissário
// largava a paz no caminho, o soldado deixava o bando —, entre os colonos ia a criança que fosse o corpo do deus (e os pais
// partiam deixando os bebês: L-442), e o casamento real mandava o corpo morar com o outro povo.
// Cinco que não podem ir — o corpo do deus, um preso na cela, um emissário a caminho, um soldado de um bando e um mercador
// com a sua caravana:
//  f1 no mundo pronto (a «mega», por padrão), na maior cidade com cadeia, o corpo uma moça casada: nenhum dos cinco está entre
//     os fundadores, em 200 escolhas (200 sortes do mundo);
//  f2 entre os fundadores, todos podem ir, e cada casal leva os filhos pequenos que estão na cidade;
//  f3 os colonos de um navio — num mundo de ilhas (num continente dos mundos prontos não sobra praia livre: toda relva fica a
//     menos de 16 casas de uma cidade), numa cidade com cais e cadeia, o corpo uma criança: os cinco ficam, e os pais da
//     criança com ela; nenhum colono que não pudesse ir; cada casal leva os seus, e nenhum deixa um bebê para trás (L-442);
//  f4 um tempo de mundo depois (30 s no mundo pronto, 10 s no das ilhas): o corpo ainda é do deus, o preso na cela, o
//     emissário a caminho (no mundo pronto: nas ilhas ele não tem caminho a pé até o outro povo e desiste sozinho), o soldado
//     no bando, e o verificador limpo (S0–S2), sem erro de página nem aviso no console.
//  f5 o de verdade: uma capital crescida demais funda uma vila no dia novo do próprio mundo (checkExpansion), e a única moça
//     casada jovem da cidade é o corpo do deus: os fundadores vão, ela fica, do deus e na sua cidade; o preso fica na cela.
//  f6 o casamento real de uma aliança (G.Politics.deliver): a filha do governante que iria morar com o outro povo é o corpo
//     do deus — ela fica na sua cidade, do deus, sem casar pela mão do mundo.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const WORLD = process.argv[2] || 'mega';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | fundadores ${name} | ${info}`); if (!c) fails.push(name); };
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] }); const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' }); await page.addScriptTag({ path: path.join(ROOT, 'worlds', WORLD + '.js') });
  // (in the page: the five who cannot go, made in a town; their state; the families of a list that are not whole)
  await page.evaluate(() => {
    window.__F = {
      five(set, child) {
        const S = G.S; const f = G.Fac.get(set.fac); const other = G.Fac.all().find(o => o.alive && o.id !== f.id);
        const here = v => v.set === set.id && !v.captive && !v.aboard && !v.jail && !v.held && !v.air && !v.ug && v.hp > 60;
        const wives = [...S.villagers.values()].filter(v => here(v) && v.g === 'f' && v.partner && v.age >= 18 && v.age < 42 && S.villagers.get(v.partner) && S.villagers.get(v.partner).set === set.id).sort((a, b) => a.id - b.id);
        const singles = [...S.villagers.values()].filter(v => here(v) && !v.partner && v.age >= 17 && v.age < 32 && v.id !== f.leader).sort((a, b) => a.id - b.id);
        const kids = child ? [...S.villagers.values()].filter(v => here(v) && v.age >= 7 && v.age < 16 && S.villagers.get(v.mother) && S.villagers.get(v.father) && S.villagers.get(v.mother).set === set.id && S.villagers.get(v.father).set === set.id).sort((a, b) => a.id - b.id) : [];
        const body = (child ? kids : wives).find(v => G.Possess.can(v).ok); if (!body) return { err: child ? 'nenhuma criança com pai e mãe que o deus possa tomar' : 'nenhuma moça casada que o deus possa tomar' };
        const took = G.Possess.take(body); if (!took.ok) return { err: 'o deus não tomou o corpo: ' + (took.why || '') };
        const [pris, env, sold, merc] = singles.filter(v => v !== body).slice(0, 4); if (!merc) return { err: 'solteiros de menos na cidade' };
        const jail = [...S.buildings.values()].filter(b => b.type === 'cadeia' && b.set === set.id && b.built).sort((a, b) => a.id - b.id)[0];
        if (!jail) return { err: 'a cidade não tem cadeia' };
        pris.jail = jail.id; pris.jailUntil = S.day + 3; G.Vg.setTask(pris, { type: 'wander', pri: 1 }); // (the cell takes them: G.Crime.keeps)
        const rel = G.Fac.rel(f.id, other.id);
        G.Vg.endTask(env); G.Vg.setTask(env, { type: 'envoy', to: other.id, from: f.id, msg: 'contato', pri: 3.1, kind: 'envoy' }); if (rel) { rel.envoy = env.id; rel.envoyDay = S.day; }
        const band = G.War.makeBand(f, other, set, [sold], 'defesa', {});
        G.Vg.endTask(merc); G.Vg.setTask(merc, { type: 'trade', to: other.id, from: f.id, give: 'food', n: 1, want: 'moedas', pri: 1.8, kind: 'trade' });
        return { f, set, body, pris, env, sold, merc, band, list: [body, pris, env, sold, merc], ids: new Set([body, pris, env, sold, merc].map(v => v.id)) };
      },
      tasks: c => ({ body: c.body.task && c.body.task.type, pris: c.pris.task && c.pris.task.type, env: c.env.task && c.env.task.type, sold: c.sold.task && c.sold.task.type, merc: c.merc.task && c.merc.task.type }),
      after: c => { const S = G.S; return { avatar: !!(S.avatar && S.avatar.id === c.body.id && c.body.task && c.body.task.type === 'avatar'), home: c.body.set === c.set.id, pris: !!(c.pris.jail && c.pris.task && (c.pris.task.type === 'cela' || c.pris.task.type === 'levado')), env: c.env.task ? c.env.task.type : '-', sold: G.War.bands.has(c.band.id) && c.band.members.includes(c.sold.id) && !!c.sold.task && c.sold.task.type === 'band' }; },
      broken(set, list) { const S = G.S; const L = new Set(list.map(v => v.id)); const bad = []; for (const v of list) if (v.g === 'f' && v.partner && L.has(v.partner)) { const p = S.villagers.get(v.partner); for (const k of S.villagers.values()) if (k.set === set.id && k.age < 16 && (k.mother === v.id || k.father === p.id) && !L.has(k.id)) bad.push(k.name + '#' + k.id); } return bad; },
      clean: () => QA.check().filter(e => e.sev <= 2).map(e => e.msg),
    };
  });
  // f1, f2, f4 — the ready world
  const r = await page.evaluate(W => {
    G.Save.apply(JSON.parse(G.Ready.data[W])); G.Main.mode = 'game'; G.UI.setSpeed(0); const S = G.S;
    if (G.Audio) { G.Audio.mute = true; G.Audio.sfxOn = false; G.Audio.musicOn = false; }
    const pop = s => [...S.villagers.values()].filter(v => v.set === s.id).length;
    const set = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Fac.get(s.fac).alive && [...S.buildings.values()].some(b => b.type === 'cadeia' && b.set === s.id && b.built)).sort((a, b) => pop(b) - pop(a) || a.id - b.id)[0];
    if (!set) return { err: 'nenhuma cidade com cadeia' };
    const c = __F.five(set); if (c.err) return { err: c.err };
    const out = { town: set.name, pop: pop(set), five: c.list.map(v => v.name + '#' + v.id), t0: __F.tasks(c) };
    if (G.Village.pickFounders) {
      let gone = 0; const sizes = [], badSend = [], broken = [];
      for (let k = 0; k < 200; k++) {
        const ch = [...G.Village.pickFounders(set, pop(set))]; sizes.push(ch.length);
        if (ch.some(v => c.ids.has(v.id))) gone++;
        for (const v of ch) if (!G.Vg.canSend(v)) badSend.push(v.name + '#' + v.id);
        broken.push(...__F.broken(set, ch));
      }
      Object.assign(out, { picked: true, gone, sizes: [Math.min(...sizes), Math.max(...sizes)], badSend: [...new Set(badSend)].slice(0, 4), broken: [...new Set(broken)].slice(0, 4) });
    }
    G.Vg.endTask(c.merc); // (the caravan made by hand carries nothing: its errand ends before the world goes on)
    for (let k = 0; k < 300; k++) G.debug.step(0.1);
    out.after = __F.after(c); out.bad = __F.clean().slice(0, 4);
    return out;
  }, WORLD);
  if (r.err) ok('f1 a cidade do caso', false, r.err);
  else {
    ok('f1 o corpo do deus, o preso, o emissário, o soldado e o mercador nunca vão fundar a vila nova', !!r.picked && r.gone === 0 && r.t0.body === 'avatar' && /cela|levado/.test(r.t0.pris) && r.t0.env === 'envoy' && r.t0.sold === 'band' && r.t0.merc === 'trade',
      r.picked ? `${r.town} (${r.pop} almas): ${r.five.join(', ')} (tarefas ${JSON.stringify(r.t0)}); 200 escolhas de ${r.sizes[0]} a ${r.sizes[1]} fundadores, ${r.gone} com algum dos cinco` : 'sem G.Village.pickFounders: a escolha dos fundadores fica dentro do checkExpansion, sem filtro nenhum');
    ok('f2 os fundadores podem ir, e cada casal leva os seus pequenos', !!r.picked && !r.badSend.length && !r.broken.length, !r.picked ? '-' : `${r.badSend.length ? 'não podiam ir: ' + r.badSend.join(', ') : 'todos podiam ir'}; ${r.broken.length ? 'filhos deixados: ' + r.broken.join(', ') : 'nenhum filho pequeno deixado para trás'}`);
  }
  // f3 — the colonists of a ship (G.Expe.colony, where the towns' colonizing by sea goes: Naval.colonize hands it over), on a
  // sea world of its own (a continent of the ready worlds has no free shore left), in a town with a quay and a jail: the five
  // stay — the god's body a child this time, and its parents with it (a family goes only whole)
  const r3 = await page.evaluate(() => {
    G.Main.newGame({ type: 'mar', size: 128, tribes: 3, temper: 'pacifico', relevo: 'suave', seed: 7 }); G.Main.mode = 'game'; G.UI.setSpeed(0);
    const S = G.S; const Nv = G.Naval; const K = G.Know; let g = 0; while (S.day < 1 && g++ < 100000) G.debug.step(0.1);
    const f = G.Fac.all()[0]; const set = G.Fac.capitalOf(f.id); const other = G.Fac.all().find(o => o.id !== f.id);
    f.tech.known.navegacao = 1; f.stock.wood += 600; f.stock.food += 900;
    // (families as the sea's proofs grow them, qa/mar17.js — each with a child here, the parents old enough for it)
    for (let k = 0; k < 16; k++) { const p0 = G.W.nearestLand(set.cx + G.rr(-6, 6), set.cy + G.rr(-6, 6), 5); if (!p0) continue; const a = G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 27 + G.R() * 12, g: 'm' }); const b = G.Vg.create({ set: set.id, x: p0[0] + 0.5, y: p0[1], age: 27 + G.R() * 12, g: 'f' }); a.partner = b.id; b.partner = a.id; const ch = G.Vg.create({ set: set.id, x: p0[0], y: p0[1] + 0.5, age: 7 + G.R() * 6, mother: b.id, father: a.id }); a.kids.push(ch.id); b.kids.push(ch.id); }
    for (let k = 0; k < 6; k++) { const p0 = G.W.nearestLand(set.cx + G.rr(-6, 6), set.cy + G.rr(-6, 6), 5); if (p0) G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 18 + G.R() * 10, g: k % 2 ? 'm' : 'f' }); }
    // (and three with a baby under two: the ship took the parents and left the babies, L-442)
    for (let k = 0; k < 3; k++) { const p0 = G.W.nearestLand(set.cx + G.rr(-6, 6), set.cy + G.rr(-6, 6), 5); if (!p0) continue; const a = G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 24 + G.R() * 8, g: 'm' }); const b = G.Vg.create({ set: set.id, x: p0[0] + 0.5, y: p0[1], age: 22 + G.R() * 8, g: 'f' }); a.partner = b.id; b.partner = a.id; const ch = G.Vg.create({ set: set.id, x: p0[0], y: p0[1] + 0.5, age: 0.6, mother: b.id, father: a.id }); a.kids.push(ch.id); b.kids.push(ch.id); }
    let dock = null; const r0 = set.radius; for (const R of [8, 14, 20, 28, 36]) { set.radius = R; const site = G.City.dockSite(set); if (site) { dock = G.Village.addBuilding('doca', site[0], site[1], set.id, true); break; } } set.radius = r0;
    const js = G.Village.findSite(set, 'cadeia'); const jail = js ? G.Village.addBuilding('cadeia', js[0], js[1], set.id, true) : null;
    G.W.touchWalk();
    if (!dock || !jail || !Nv.canSail(f)) return { err: `sem ${!dock ? 'cais' : !jail ? 'cadeia' : 'mar aberto do cais'} em ${set.name}` };
    const c = __F.five(set, true); if (c.err) return { err: c.err };
    const t0 = __F.tasks(c);
    // the shore over the water: a known island that is not theirs
    const own = K.at(set.cx, set.cy); const reg = K.regions().filter(q => K.big(q) && q !== own).sort((a, b) => b.cells - a.cells || a.key - b.key)[0];
    if (!reg) return { err: 'nenhuma outra ilha no mapa' };
    K.raise(f.id, reg, K.MAP, { via: 'teste' });
    // (room for every family the town can send: the one of the god's body would go too, if it could)
    const e = G.Expe.colony(f, { r: reg, site: { x: reg.cx, y: reg.cy, sc: 8 }, motive: 'terra' }, 60, Nv.docksOf(f.id));
    if (!e) return { err: `nenhuma colônia saiu de ${set.name}`, t0 };
    const crew = e.crew.map(id => S.villagers.get(id)).filter(Boolean);
    const parents = [c.body.mother, c.body.father].filter(id => e.crew.includes(id)).map(id => S.villagers.get(id).name);
    const kids = []; for (const v of crew) if (v.g === 'f' && v.partner && e.crew.includes(v.partner)) { const p = S.villagers.get(v.partner); for (const k of S.villagers.values()) if (k.set === set.id && k.age < 16 && (k.mother === v.id || k.father === p.id) && !e.crew.includes(k.id)) kids.push(k.name + '#' + k.id + (k.age < 2 ? ' (bebê)' : '')); }
    const out = { town: set.name, t0, n: crew.length, child: c.body.name + ' (' + Math.floor(c.body.age) + ' anos)', five: crew.filter(v => c.ids.has(v.id)).map(v => v.name), parents, bad: crew.filter(v => v.captive || v.jail || v.held || v.ug || v.air || (S.avatar && S.avatar.id === v.id)).map(v => v.name), kids };
    G.Vg.endTask(c.merc);
    for (let k = 0; k < 100; k++) G.debug.step(0.1);
    out.after = __F.after(c); out.bad2 = __F.clean().slice(0, 4);
    return out;
  });
  if (r3.err) ok('f3 os colonos de um navio: os cinco ficam (o corpo uma criança, e os pais com ela), as famílias inteiras', false, r3.err);
  else ok('f3 os colonos de um navio: os cinco ficam (o corpo uma criança, e os pais com ela), as famílias inteiras', r3.n >= 5 && !r3.five.length && !r3.parents.length && !r3.bad.length && !r3.kids.length && r3.t0.body === 'avatar' && /cela|levado/.test(r3.t0.pris),
    `${r3.town} (ilhas): ${r3.n} colonos; o corpo do deus: ${r3.child}; dos cinco no navio: ${r3.five.join(', ') || 'nenhum'}; pais do corpo no navio: ${r3.parents.join(', ') || 'nenhum'}; sem poder ir: ${r3.bad.join(', ') || 'nenhum'}; filhos deixados: ${r3.kids.join(', ') || 'nenhum'}`);
  const a1 = r.after || {}, a3 = r3.after || {};
  // f5 — the real thing: a capital grown past its size founds a village on the world's own new day (checkExpansion), and the
  // town's only young wife is the god's body (the other wives past 42, the age of the founders): the founders go, and she
  // stays the god's, in her town; one in the cell stays in the cell
  const r5 = await page.evaluate(() => {
    G.Main.newGame({ type: 'continente', size: 96, tribes: 2, temper: 'pacifico', relevo: 'suave', seed: 11 }); G.Main.mode = 'game'; G.UI.setSpeed(0);
    const S = G.S; let g = 0; while (S.day < 1 && g++ < 100000) G.debug.step(0.1);
    const f = G.Fac.all()[0]; const set = G.Fac.capitalOf(f.id); f.stock.food += 1500; f.stock.wood += 400;
    const at = () => G.W.nearestLand(set.cx + G.rr(-5, 5), set.cy + G.rr(-5, 5), 5);
    const p1 = at(); const man = G.Vg.create({ set: set.id, x: p1[0], y: p1[1], age: 28, g: 'm' }); const wife = G.Vg.create({ set: set.id, x: p1[0] + 0.5, y: p1[1], age: 26, g: 'f' }); man.partner = wife.id; wife.partner = man.id;
    for (let k = 0; k < 10; k++) { const p0 = at(); if (p0) G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 18 + G.R() * 10, g: k % 2 ? 'm' : 'f' }); }
    for (let k = 0; k < 40; k++) { const p0 = at(); if (p0) G.Vg.create({ set: set.id, x: p0[0], y: p0[1], age: 44 + G.R() * 12, g: k % 2 ? 'm' : 'f' }); }
    for (const v of S.villagers.values()) if (v.set === set.id && v.g === 'f' && v.partner && v.age < 42 && v !== wife) v.age = 42.5;
    const js = G.Village.findSite(set, 'cadeia'); const jail = js ? G.Village.addBuilding('cadeia', js[0], js[1], set.id, true) : null; G.W.touchWalk();
    if (!jail) return { err: 'sem lugar para a cadeia' };
    const wives = [...S.villagers.values()].filter(v => v.set === set.id && v.g === 'f' && v.partner && v.age < 42 && !v.captive);
    const body = wives.length === 1 && wives[0] === wife && G.Possess.can(wife).ok ? wife : null; if (!body) return { err: `moças casadas jovens: ${wives.length}` };
    if (!G.Possess.take(body).ok) return { err: 'o deus não tomou o corpo' };
    const pris = [...S.villagers.values()].filter(v => v.set === set.id && !v.partner && v.age >= 17 && v.age < 32 && !v.captive).sort((a, b) => a.id - b.id)[0];
    pris.jail = jail.id; pris.jailUntil = S.day + 5; G.Vg.setTask(pris, { type: 'wander', pri: 1 });
    set.founded = S.day - 10;
    const n0 = S.settlements.size, d0 = S.day; let k = 0;
    while (S.settlements.size === n0 && S.day - d0 < 8 && k++ < 200000) G.debug.step(0.1);
    const ns = [...S.settlements.values()].find(s => s.id !== set.id && s.fac === f.id);
    const went = ns ? [...S.villagers.values()].filter(v => v.set === ns.id).length : 0;
    return { town: set.name, pop: [...S.villagers.values()].filter(v => v.set === set.id).length, body: body.name, founded: !!ns, village: ns ? ns.name : '', went, days: +(S.day - d0).toFixed(2),
      avatar: !!(S.avatar && S.avatar.id === body.id && body.task && body.task.type === 'avatar'), home: body.set === set.id, pris: !!(pris.jail && pris.task && (pris.task.type === 'cela' || pris.task.type === 'levado')), prisSet: pris.set === set.id, bad: __F.clean().slice(0, 4) };
  });
  if (r5.err) ok('f5 a cidade funda uma vila no dia novo do mundo: o corpo do deus fica dela e do deus, o preso na cela', false, r5.err);
  else ok('f5 a cidade funda uma vila no dia novo do mundo: o corpo do deus fica dela e do deus, o preso na cela', r5.founded && r5.went >= 4 && r5.avatar && r5.home && r5.pris && r5.prisSet && !r5.bad.length,
    `${r5.town} (${r5.pop} almas; a única moça casada jovem, ${r5.body}, é o corpo do deus): ${r5.founded ? `${r5.went} fundaram ${r5.village} em ${r5.days} dias` : `nenhuma vila em ${r5.days} dias`}; o corpo ${r5.avatar ? 'ainda do deus' : 'perdido pelo deus'}${r5.home ? ', na cidade' : ', foi embora'}; o preso ${r5.pris && r5.prisSet ? 'na cela' : 'fora da cela'}; ${r5.bad.join(' | ') || 'verificador limpo'}`);
  // f6 — a royal marriage (an alliance sealed, G.Politics.deliver): the ruler's single child who would go to live with the
  // other people is the god's body — another goes, or none; the body stays in its town, unmarried by the world
  const r6 = await page.evaluate(() => {
    G.Main.newGame({ type: 'continente', size: 96, tribes: 2, temper: 'pacifico', relevo: 'suave', seed: 13 }); G.Main.mode = 'game'; G.UI.setSpeed(0);
    const S = G.S; const P = G.Politics; let g = 0; while (S.day < 1 && g++ < 100000) G.debug.step(0.1);
    const [a, b] = G.Fac.all(); const ra = P.ruler(a), rb = P.ruler(b); if (!ra || !rb) return { err: 'um dos povos sem governante' };
    // (the child who moves is the weaker people's: royalMarriage; the two made here first among the rulers' children, so that
    // they are the first pair it looks at)
    const weak = P.strength(a.id) >= P.strength(b.id) ? b : a; const strong = weak === a ? b : a;
    const kid = (r, gg, age) => { const v = G.Vg.create({ set: r.set, x: r.x + 0.5, y: r.y, age, g: gg, mother: r.g === 'f' ? r.id : 0, father: r.g === 'm' ? r.id : 0 }); (r.kids || (r.kids = [])).unshift(v.id); return v; };
    const kw = kid(weak === a ? ra : rb, 'f', 21), ks = kid(strong === a ? ra : rb, 'm', 23);
    if (!G.Possess.take(kw).ok) return { err: 'o deus não tomou o corpo da filha do governante' };
    const set0 = kw.set, fac0 = G.Fac.idOfV(kw);
    const r = G.Fac.rel(a.id, b.id); if (!r) return { err: 'os dois povos sem relação' };
    r.st = 'paz'; r.op = 90; r.met = r.met || S.day; r.envoy = 0;
    P.deliver(a, b, 'alianca', null); if (r.st !== 'alianca') { r.st = 'paz'; P.deliver(b, a, 'alianca', null); }
    return { allied: r.st === 'alianca', body: kw.name, weak: weak.name, home: kw.set === set0 && G.Fac.idOfV(kw) === fac0, avatar: !!(S.avatar && S.avatar.id === kw.id && kw.task && kw.task.type === 'avatar'), wed: kw.partner ? (S.villagers.get(kw.partner) || {}).name || '?' : '', other: ks.partner ? 'casou' : 'solteiro', bad: __F.clean().slice(0, 4) };
  });
  if (r6.err) ok('f6 o casamento real: o filho que iria morar com o outro povo é o corpo do deus — ele fica', false, r6.err);
  else ok('f6 o casamento real: o filho que iria morar com o outro povo é o corpo do deus — ele fica', r6.allied && r6.home && r6.avatar && !r6.wed && !r6.bad.length,
    `aliança ${r6.allied ? 'selada' : 'não selada'}; ${r6.body} (filha do governante de ${r6.weak}, o povo mais fraco): ${r6.home ? 'ficou na sua cidade' : 'foi morar com o outro povo'}${r6.wed ? ', casada com ' + r6.wed : ''}, ${r6.avatar ? 'ainda do deus' : 'perdida pelo deus'}; ${r6.bad.join(' | ') || 'verificador limpo'}`);
  // (on the islands the envoy to another people has no road on foot and gives up on his own: he is judged on the ready world)
  const good = (a, road) => a.avatar && a.home && a.pris && (!road || a.env === 'envoy') && a.sold;
  ok('f4 um tempo depois: o corpo é do deus, o preso na cela, o emissário a caminho, o soldado no bando; verificador limpo', !r.err && !r3.err && good(a1, true) && good(a3, false) && !(r.bad || []).length && !(r3.bad2 || []).length && !errs.length,
    `mundo pronto ${JSON.stringify(a1)}, ilhas ${JSON.stringify(a3)}; ${(r.bad || []).concat(r3.bad2 || []).join(' | ') || 'verificador limpo'}; ${errs.slice(0, 3).join(' · ') || 'sem erro de página'}`);
  console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
  await browser.close(); process.exit(fails.length ? 1 : 0);
})();
