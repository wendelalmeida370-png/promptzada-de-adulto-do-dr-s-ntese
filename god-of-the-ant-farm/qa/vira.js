// vira: node qa/vira.js — quando um povo muda de mãos ou acaba, no mundo pronto «guerra mundial»:
// 1 o guerreiro cuja cidade passa a outro povo no meio de um saque (uma secessão, uma conquista) sai do bando e volta para
//   casa — ninguém marcha com um bando que não o tem na lista (L-088);
// 2 morre a última alma de um povo (o menor que não tem cativos nas suas cidades, T-318): o povo acaba junto, não um minuto
//   depois (L-090);
// 3 morre a última alma livre de um povo que tinha cativos nas suas cidades: os cativos ficam livres, e a cidade é deles;
// 4 entre esses cativos, a governante de outro povo, feita cativa um instante antes: livre e da cidade, o povo dela tem outro
//   governante na hora, nunca um governante livre de outro povo (L-542);
// 5 a capital tomada com o governante dentro, por um povo que faz cidadãos dos vencidos — de um povo que tem fora dela quem a
//   corte coroe (um adulto livre noutra cidade dele): ele é do vencedor agora, e o povo dele tem outro governante na hora
//   (L-542);
// 6 a conquista que deixa um povo só com cidades vazias: o povo acaba na hora (L-685);
// 7 o povo que acaba leva na hora os exércitos, as frotas e as expedições dele — nada de um povo morto em campo ou no mar,
//   nem meio segundo (L-733) —, e os navios dele nos cais (L-808);
// e o verificador fica limpo em todos.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192'] }); const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts/.test(t)) errs.push('console: ' + t.slice(0, 300)); });
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await page.goto(process.env.GAME || 'file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
  await page.addScriptTag({ path: __dirname + '/qa.js' }); await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'mundial.js') });
  const r = await page.evaluate(() => {
    G.Save.apply(JSON.parse(G.Ready.data.mundial)); G.Main.mode = 'game'; G.UI.setSpeed(0); const S = G.S;
    const F = G.Fac.all(); let f = null, en = null; for (const a of F) for (const c of F) if (a !== c && G.Fac.atWar(a.id, c.id) && !f) { f = a; en = c; }
    if (!f) return { ok: false, info: 'nenhuma guerra no mundo pronto' };
    const set = G.Fac.capitalOf(f.id); const target = G.Fac.capitalOf(en.id);
    const men = [...S.villagers.values()].filter(v => v.set === set.id && v.age >= 18 && v.age < 50 && !v.captive && !v.aboard && !v.jail && !v.ug).slice(0, 5);
    const b = G.War.makeBand(f, en, target, men, 'saque', {});
    const v = S.villagers.get(b.members[b.members.length - 1]);
    const other = [...S.settlements.values()].find(s => s.fac !== b.fac && G.Fac.get(s.fac) && G.Fac.get(s.fac).alive);
    v.set = other.id; // (his town went over to another people)
    for (let k = 0; k < 20; k++) G.debug.step(0.05);
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    const ok = !(v.task && v.task.type === 'band' && v.task.band === b.id) && !b.members.includes(v.id) && !bad.length;
    return { ok, info: `bando ${b.id} de ${f.name}; ${v.name} agora é de ${G.Fac.get(other.fac).name}: tarefa ${v.task ? v.task.type : '-'}, na lista ${b.members.includes(v.id)}; ${bad.slice(0, 3).join(' | ') || 'verificador limpo'}` };
  });
  console.log(`${r.ok ? 'PASSOU' : 'FALHOU'} | guerreiro que muda de povo sai do bando | ${r.info}`);
  const r2 = await page.evaluate(() => {
    const S = G.S; const F = G.Fac.all().filter(f => f.alive);
    // the smallest people of the world that holds no captives in its towns loses its people one by one (one that holds captives
    // does not end with its last free soul: they inherit its town — the case 3 below; on the «guerra mundial» of the generation
    // 9 the smallest, the Casa de Amon, held 2, and lived on with them — T-318)
    const holds = o => [...S.villagers.values()].some(v => v.captive && (S.settlements.get(v.set) || {}).fac === o.id);
    const f = F.filter(o => !holds(o)).sort((a, b) => G.Fac.pop(a.id) - G.Fac.pop(b.id))[0];
    if (!f) return { ok: false, info: 'nenhum povo sem cativos nas suas cidades' };
    const mine = [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) === f.id);
    for (const v of mine.slice(0, -1)) G.Village.kill(v, 'sick');
    const before = f.alive; G.Village.kill(mine[mine.length - 1], 'sick');
    const after = f.alive; for (let k = 0; k < 4; k++) G.debug.step(0.05);
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    return { ok: before && !after && !bad.length, info: `${f.name} (${mine.length} almas): vivo antes da última morte ${before}; depois ${after}; ${bad.slice(0, 3).join(' | ') || 'verificador limpo'}` };
  });
  console.log(`${r2.ok ? 'PASSOU' : 'FALHOU'} | a última alma morre e o povo acaba junto | ${r2.info}`);
  const r3 = await page.evaluate(() => {
    const S = G.S; const F = G.Fac.all().filter(f => f.alive).sort((a, b) => G.Fac.pop(a.id) - G.Fac.pop(b.id));
    const f = F[0]; const cap = G.Fac.capitalOf(f.id);
    // two strangers taken captive into its capital
    const strangers = [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) !== f.id && v.age >= 16 && !v.aboard && !v.ug && !v.jail).slice(0, 2);
    for (const v of strangers) { G.War.enslave(v, G.Fac.idOfV(v), v.set); v.set = cap.id; v.x = cap.cx; v.y = cap.cy; }
    const mine = [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) === f.id);
    for (const v of mine) G.Village.kill(v, 'sick');
    for (let k = 0; k < 4; k++) G.debug.step(0.05);
    const held = [...S.villagers.values()].filter(v => v.captive && (S.settlements.get(v.set) || {}).fac === f.id).length;
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    return { ok: f.alive && G.Fac.pop(f.id) >= 2 && !held && !bad.length, info: `${f.name}: ${mine.length} almas livres morreram, ${strangers.length} cativos na capital; vivo ${f.alive}, povo agora ${G.Fac.pop(f.id)}, ainda cativos ${held}; ${bad.slice(0, 3).join(' | ') || 'verificador limpo'}` };
  });
  console.log(`${r3.ok ? 'PASSOU' : 'FALHOU'} | a última alma livre morre e os cativos herdam a cidade | ${r3.info}`);
  // 4 the ruler of another people among the captives who inherit the town: taken a moment before (the court passes a captive's
  // throne within the second), she is one of the town's people now — her people gets its new ruler at once, never a free
  // ruler of another people (L-542: the queen of Lavínio, a captive in Mileto, in the case 3 of the generation 14)
  const r4 = await page.evaluate(() => {
    const S = G.S; const F = G.Fac.all().filter(f => f.alive && G.Fac.capitalOf(f.id)).sort((a, b) => G.Fac.pop(a.id) - G.Fac.pop(b.id));
    const f = F[0]; const cap = G.Fac.capitalOf(f.id);
    const g = F.find(o => o !== f && o.leader && S.villagers.has(o.leader) && !S.villagers.get(o.leader).captive && G.Fac.pop(o.id) >= 4);
    if (!f || !g) return { ok: false, info: 'sem dois povos para o caso' };
    const queen = S.villagers.get(g.leader); const other = [...S.villagers.values()].find(v => !v.captive && G.Fac.idOfV(v) !== f.id && v !== queen && v.age >= 16 && !v.aboard && !v.ug && !v.jail);
    for (const v of [queen, other].filter(Boolean)) { G.War.enslave(v, G.Fac.idOfV(v), v.set); v.set = cap.id; v.x = cap.cx; v.y = cap.cy; }
    const mine = [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) === f.id);
    for (const v of mine) G.Village.kill(v, 'sick');
    const now = g.leader !== queen.id && !!S.villagers.get(g.leader) && G.Fac.idOfV(S.villagers.get(g.leader)) === g.id;
    G.Atmos.flush(); // (the hand changed the world within the instant of the last look: who is where is counted again — T-848)
    const bad0 = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    for (let k = 0; k < 24; k++) G.debug.step(0.05);
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg); const nl = S.villagers.get(g.leader);
    return { ok: !queen.captive && G.Fac.idOfV(queen) === f.id && now && !bad0.length && !bad.length, info: `${queen.name}, governante de ${g.name}, cativa em ${cap.name}: com a morte da última alma de ${f.name} ficou livre e é de ${G.Fac.ofV(queen) ? G.Fac.ofV(queen).name : '?'}; ${g.name} ${now ? 'teve outro governante na hora' : 'NÃO TEVE OUTRO GOVERNANTE NA HORA'} (${nl ? nl.name : 'ninguém'}); ${[...bad0, ...bad].slice(0, 3).join(' | ') || 'verificador limpo na hora e um segundo depois'}` };
  });
  console.log(`${r4.ok ? 'PASSOU' : 'FALHOU'} | a governante de outro povo, cativa, herda a cidade: o povo dela tem outro governante na hora | ${r4.info}`);
  // 5 a capital taken with its ruler inside, by a people that makes citizens of the vanquished (no captives, no sword): the ruler
  // is the conqueror's now, and her people gets its new ruler at once (L-542: the ruler of Lavínio in Roma, the Clã's and still
  // Lavínio's for the second the court takes to look). Her people has someone to crown outside the capital: a soul the court
  // would crown (politics.js, P.pickLeader: an adult of the people, P.adultsOf — alive, not captive, 18 to 75 —; and here not
  // aboard, not jailed) in another of its towns. Two towns are not that: in the 19th generation cases 3 and 4 left the Clã de
  // Hrafn with all its souls in Hedeby and Lindholm empty, and taking Hedeby left it nobody (a people with towns and no soul
  // after a conquest is an open defect, for the Bairros Vivos)
  const r5 = await page.evaluate(() => {
    const S = G.S; const F = G.Fac.all();
    let X = null, Y = null;
    const heirs = (a, cap) => G.Politics.adultsOf(a.id).filter(v => v.set !== cap.id && !v.aboard && !v.jail);
    for (const a of F) { const cap = G.Fac.capitalOf(a.id); const lv = S.villagers.get(a.leader); if (X || !cap || !lv || lv.captive || lv.set !== cap.id || !heirs(a, cap).length) continue; Y = F.find(c => c !== a && !G.Politics.tyr(c) && [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === c.id && !v.captive && v.age >= 18 && v.age < 50 && !v.aboard && !v.jail && !v.ug).length >= 2) || null; if (Y) X = a; }
    if (!X) return { ok: false, info: 'nenhuma capital com o governante dentro, quem coroar fora dela e um povo para tomá-la' };
    const set = G.Fac.capitalOf(X.id); const lv = S.villagers.get(X.leader);
    const hs = heirs(X, set); const out = `${hs.length} adulto${hs.length > 1 ? 's' : ''} livre${hs.length > 1 ? 's' : ''} fora dela, em ${[...new Set(hs.map(v => S.settlements.get(v.set).name))].slice(0, 3).join(', ')}`;
    const men = [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === Y.id && v.age >= 18 && v.age < 50 && !v.captive && !v.aboard && !v.jail && !v.ug).slice(0, 4);
    const b = G.War.makeBand(Y, X, set, men, 'conquista', {}); G.Politics.leaderPe(Y).cru = 0; // (the test's hand: a people that makes citizens)
    G.War.conquer(set, b);
    const nl = S.villagers.get(X.leader); const now = !!nl && nl !== lv && G.Fac.idOfV(nl) === X.id;
    // (the town taken by the proof's hand within the instant of the case before's last look: the conquest takes nobody's life here,
    // the people of the town leave their houses, and who is awake where — counted once an instant, atmos.js — is counted again:
    // the smoke and the lit window of a house just emptied were the checker's own stale count, not the world's — T-848)
    G.Atmos.flush();
    const bad0 = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    for (let k = 0; k < 24; k++) G.debug.step(0.05);
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    return { ok: !lv.captive && S.villagers.has(lv.id) && G.Fac.idOfV(lv) === Y.id && now && !bad0.length && !bad.length, info: `${set.name}, capital de ${X.name} com ${lv.name} dentro (e ${out}), tomada por ${Y.name}: ${lv.name} é de ${G.Fac.ofV(lv) ? G.Fac.ofV(lv).name : '?'}; ${X.name} ${now ? 'teve outro governante na hora (' + nl.name + ')' : 'NÃO TEVE OUTRO GOVERNANTE NA HORA'}; ${[...bad0, ...bad].slice(0, 3).join(' | ') || 'verificador limpo na hora e um segundo depois'}` };
  });
  console.log(`${r5.ok ? 'PASSOU' : 'FALHOU'} | a capital tomada com o governante dentro: o povo dele tem outro governante na hora | ${r5.info}`);
  // 6 a people left with towns and no soul by a conquest ends at once (L-685: Hedeby taken, Lindholm empty — the Clã stayed
  // «alive with nobody» for the ten seconds the politics takes to look again). By hand: a people with two towns or more, the
  // souls outside its fullest town dead of sickness (those towns stand empty), and that town taken by a people that makes
  // citizens of the vanquished: no soul of it left — the people is gone at once, its empty towns abandoned (or, if it kept
  // captives in them, they are free and the people lives with them); the checker clean at once and a second later
  const r6 = await page.evaluate(() => {
    const S = G.S; const F = G.Fac.all(); let X = null, Y = null, set = null;
    const free = (f, s) => [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) === f.id && (!s || v.set === s.id));
    const men = c => [...S.villagers.values()].filter(v => G.Fac.idOfV(v) === c.id && v.age >= 18 && v.age < 50 && !v.captive && !v.aboard && !v.jail && !v.ug);
    for (const a of F) { const sets = G.Fac.settlementsOf(a.id); if (sets.length < 2) continue; const s0 = sets.slice().sort((p, q) => free(a, q).length - free(a, p).length || p.id - q.id)[0]; if (!free(a, s0).length) continue;
      const y = F.find(c => c !== a && !G.Politics.tyr(c) && men(c).length >= 2); if (!y) continue; X = a; Y = y; set = s0; break; }
    if (!X) return { ok: false, info: 'nenhum povo com duas cidades e gente numa delas, e outro para tomá-la' };
    const others = G.Fac.settlementsOf(X.id).filter(s => s !== set).map(s => s.name); const gone = free(X).filter(v => v.set !== set.id); for (const v of gone) G.Village.kill(v, 'sick');
    const n0 = free(X).length; const b = G.War.makeBand(Y, X, set, men(Y).slice(0, 4), 'conquista', {}); G.Politics.leaderPe(Y).cru = 0;
    G.War.conquer(set, b);
    G.Atmos.flush(); // (as in the case 5: T-848)
    const souls = free(X).length; const bad0 = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    for (let k = 0; k < 24; k++) G.debug.step(0.05);
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    return { ok: n0 > 0 && (!X.alive || souls > 0) && !bad0.length && !bad.length, info: `${set.name}, a única cidade com gente de ${X.name} (${n0} almas; ${others.join(', ')} ${gone.length ? 'esvaziada' + (others.length > 1 ? 's' : '') + ' pela doença, ' + gone.length + ' mortos' : 'já vazia' + (others.length > 1 ? 's' : '')}), tomada por ${Y.name}: ${X.alive ? (souls ? 'o povo segue com ' + souls + ' cativos libertos' : 'VIVO SEM NINGUÉM') : 'o povo acabou na hora'}; ${[...bad0, ...bad].slice(0, 2).join(' | ') || 'verificador limpo na hora e um segundo depois'}` };
  });
  console.log(`${r6.ok ? 'PASSOU' : 'FALHOU'} | a conquista que deixa um povo só com cidades vazias: o povo acaba na hora | ${r6.info}`);
  // 7 the people that ends takes its armies, fleets and expeditions with it at once (L-733): an army, a fleet or an expedition of
  // a people that had just ended lived on until its own look, half a second later or more — the checker caught «frota … povo extinto» in that half
  // second (the case 6 on the «guerra mundial» of the generation 20, where the conquered people had a fleet out). On the
  // world as it was saved (the cases above changed it), the people with a fleet and an expedition at sea and no captives in its
  // towns loses its souls one by one: at the last death nothing of it is left in the field or at sea, in that same instant, and
  // the checker is clean a moment later (an army of it, the Falange de Argos, was what the first run of this case caught)
  const r7 = await page.evaluate(() => {
    G.Save.apply(JSON.parse(G.Ready.data.mundial)); G.Main.mode = 'game'; G.UI.setSpeed(0); const S = G.S;
    const holds = o => [...S.villagers.values()].some(v => v.captive && (S.settlements.get(v.set) || {}).fac === o.id);
    const atSea = o => [...G.Wars.state().armies.filter(a => !a.done && a.fac === o.id).map(a => 'exército ' + a.name), ...G.Fleets.of(o.id).map(x => 'frota ' + x.name), ...G.Expe.active(o.id).map(x => 'expedição ' + x.name)];
    let f = G.Fac.all().filter(o => o.alive && !holds(o) && G.Fleets.of(o.id).length && G.Expe.active(o.id).length).sort((a, b) => atSea(b).length - atSea(a).length || a.id - b.id)[0];
    // (with no such people in this world — no expedition out at all in the «guerra mundial» of the generation 21, a continent
    // with no other island for a colony —, the hand of the test has the first people with a fleet out and no captives weigh the
    // sea by the game's door, as the lar and the maos do: G.Expe.consider, a dozen times at the most; T-1072)
    let made = null;
    if (!f) for (const o of G.Fac.all().filter(o => o.alive && !holds(o) && G.Fleets.of(o.id).length && G.Civ.has(o.id, 'navegacao')).sort((a, b) => a.id - b.id)) {
      let x = null; for (let k = 0; k < 12 && !x; k++) x = G.Expe.consider(o, { scale: 'media', many: true });
      if (x) { f = o; made = x.name; break; }
    }
    if (!f) return { ok: false, info: 'nenhum povo com frota e expedição no mar e sem cativos nas suas cidades' };
    // (and its ships at the quays: given to the town's people or out of the world at once, the ships' own pass — L-808)
    const docked = () => S.ships.filter(s => s.fac === f.id && !G.Naval.atSea(s)).map(s => `${s.kind}#${s.id}`); const quay0 = docked().length;
    const was = atSea(f); const mine = [...S.villagers.values()].filter(v => !v.captive && G.Fac.idOfV(v) === f.id);
    for (const v of mine) G.Village.kill(v, 'sick');
    const left = atSea(f); const quay = docked(); const sea0 = QA.check().filter(e => e.sev <= 2 && / povo .*extinto$/.test(e.msg) && /^(exército|frota|expedição) /.test(e.msg)).map(e => e.msg);
    for (let k = 0; k < 4; k++) G.debug.step(0.05);
    const bad = QA.check().filter(e => e.sev <= 2).map(e => e.msg);
    return { ok: !f.alive && !left.length && !quay.length && !sea0.length && !bad.length, info: `${f.name}${made ? ` (a expedição «${made}» mandada pela mão da prova: nenhuma no mar neste mundo, T-1072)` : ''} (${mine.length} almas; em campo e no mar: ${was.join(', ')}): ${f.alive ? 'ainda vivo' : 'acabou'}; na mesma hora ${left.length ? 'ainda de pé: ' + left.join(', ') : 'nada dele em campo nem no mar'}; dos ${quay0} navios dele nos cais, ${quay.length ? 'AINDA DELE: ' + quay.slice(0, 3).join(', ') : 'nenhum ainda dele'}${sea0.length ? ' — ' + sea0.slice(0, 2).join(' | ') : ''}; ${bad.slice(0, 3).join(' | ') || 'verificador limpo'}` };
  });
  console.log(`${r7.ok ? 'PASSOU' : 'FALHOU'} | o povo que acaba leva na hora os exércitos, as frotas e as expedições dele | ${r7.info}`);
  r.ok = r.ok && r2.ok && r3.ok && r4.ok && r5.ok && r6.ok && r7.ok;
  console.log(`${errs.length ? 'FALHOU' : 'PASSOU'} | sem erros | ${errs.slice(0, 2).join(' | ') || 'nenhum'}`);
  await browser.close(); process.exit(r.ok && !errs.length ? 0 : 1);
})();
