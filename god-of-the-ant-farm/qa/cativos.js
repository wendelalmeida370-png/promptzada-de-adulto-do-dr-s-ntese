// cativos: node qa/cativos.js [mundo] — L-131, provocado de propósito: um cativo numa cidade do povo de onde foi levado
// está em casa, e livre — nunca "cativo do próprio povo". No mundo pronto «guerra mundial» (worlds/mundial.js; ou outro):
// 1 uma cidade tomada se rebela e volta para o seu povo (Politics.revert): os cativos desse povo lá dentro ficam livres;
//   o cativo de um terceiro povo que vive lá continua cativo;
// 2 uma cidade ocupada se levanta contra os ocupantes (a ocupação das guerras): o mesmo;
// 3 uma paz branca devolve a cidade ocupada: o mesmo;
// 4 salvar e carregar: quem é cativo continua igual;
// e num arquipélago novo:
// 5 um cativo levado de uma ilha naufraga perto dela, numa terra sem cidade dos captores: chega em casa livre.
// No fim de cada mundo, o verificador inteiro.
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const key = process.argv[2] || 'mundial';
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
  // (the helpers, in the page)
  await page.evaluate(() => {
    const C = window.__C = {
      own: () => QA.check().filter(q => /cativo do próprio povo/.test(q.msg)),
      adults: set => [...G.S.villagers.values()].filter(v => v.set === set.id && v.age >= 16 && !v.captive && !v.aboard && !v.wrecked && !v.jail && !(G.Expe && G.Expe.memberOf(v.id)) && !(G.S.avatar && G.S.avatar.id === v.id)),
      freeOf: caps => caps.filter(v => G.S.villagers.has(v.id) && !v.captive).length,
      line: (n, re) => (G.S.history.slice(-n).reverse().find(h => re.test(h.txt)) || {}).txt || '-',
      // a town of A held by B: its people B's by the town, three of them captives taken from A (B's garrison is none: the
      // warriors of the town are A's people, who rise with it)
      hold(T, A, B, war) {
        T.fac = B.id; T.origFac = A.id; T.conq = G.S.day; T.loyalty = 20;
        if (war !== undefined) T.occ = { by: B.id, from: A.id, day: G.S.day, war: war ? war.id : 0 };
        const caps = C.adults(T).slice(0, 3); for (const v of caps) { G.Vg.endTask(v); G.War.enslave(v, A.id, T.id); }
        for (const v of C.adults(T)) if (v.role === 'guerreiro' || v.vet) { v.role = null; v.vet = 0; }
        G.Fac.updateTerritory();
        return caps;
      },
    };
  });

  // ------------------------------ the ready world: the towns that go back ------------------------------
  const r0 = await page.evaluate(key => {
    G.Save.apply(JSON.parse(G.Ready.data[key])); G.Main.mode = 'game'; G.UI.setSpeed(0); if (G.Audio) G.Audio.mute = true;
    const S = G.S, C = __C; C.base = new Set(QA.check().filter(e => e.sev <= 2).map(e => e.id + '|' + e.msg));
    const fs = G.Fac.all().filter(f => f.alive); const towns = f => G.Fac.settlementsOf(f.id).filter(s => C.adults(s).length >= 5 && G.Fac.capitalOf(f.id) !== s);
    let A = null, B = null; for (const a of fs) for (const b of fs) if (!A && a !== b && towns(a).length >= 3 && G.Fac.settlementsOf(b.id).length) { A = a; B = b; }
    if (!A) return { err: 'nenhum povo com três cidades (fora a capital) de cinco adultos ou mais' };
    const [T1, T2, T3] = towns(A); C.A = A; C.B = B; C.T = [T1, T2, T3];
    C.third = fs.find(f => f !== A && f !== B) || null;
    return { A: A.name, B: B.name, T: [T1.name, T2.name, T3.name], third: C.third && C.third.name, day: S.day };
  }, key);
  if (r0.err) { ok('o mundo serve', false, r0.err); await browser.close(); process.exit(1); }
  console.log(`(${key}, dia ${r0.day}: ${r0.A} e ${r0.B}; as cidades ${r0.T.join(', ')}; um terceiro povo: ${r0.third || '-'})`);

  // 1. it rebels back
  const r1 = await page.evaluate(() => {
    const S = G.S, C = __C, [T1] = C.T; const caps = C.hold(T1, C.A, C.B);
    // (and one captive of a third people living there: their captivity is not the town's people's business)
    let o = null; if (C.third) { o = C.adults(G.Fac.capitalOf(C.B.id))[0] || null; if (o) { G.Vg.endTask(o); G.War.enslave(o, C.third.id, o.set); o.set = T1.id; o.home = 0; } }
    G.Politics.revert(T1);
    return { back: T1.fac === C.A.id, n: caps.length, free: C.freeOf(caps), bio: caps.filter(v => (v.bio || []).some(b => b[1] === 'freed')).length, own: C.own().filter(q => caps.some(v => q.msg.includes('#' + v.id))).length, other: o ? !!o.captive : null, line: C.line(4, new RegExp(T1.name)) };
  });
  ok('1 a cidade tomada se rebela e volta para o seu povo: os cativos desse povo lá dentro ficam livres', r1.back && r1.free === r1.n && !r1.own && r1.bio === r1.n, JSON.stringify(r1));
  ok('1 o cativo de um terceiro povo que vive lá continua cativo', r1.other !== false, `cativo: ${r1.other}`);

  // 2. it rises against the occupier
  const r2 = await page.evaluate(() => {
    const C = __C, [, T2] = C.T; const caps = C.hold(T2, C.A, C.B, null);
    // (three days of the occupation at once: the rising is sure — the old masters' friends inside, no garrison, the town
    // unhappy; waited for day by day it is a matter of luck, and the captives die or flee in the meantime)
    G.Wars._occupationTick(3);
    return { rose: T2.fac === C.A.id, n: caps.length, free: C.freeOf(caps), own: C.own().filter(q => caps.some(v => q.msg.includes('#' + v.id))).length, line: C.line(10, new RegExp(T2.name + '.*levantou')) };
  });
  ok('2 a cidade ocupada se levanta contra os ocupantes: os cativos do seu povo ficam livres', r2.rose && r2.free === r2.n && !r2.own, JSON.stringify(r2));

  // 3. given back at the peace
  const r3 = await page.evaluate(() => {
    const C = __C, [, , T3] = C.T; const r = G.Fac.rel(C.A.id, C.B.id);
    if (r && r.st !== 'guerra') G.Politics.declareWar(C.B, C.A, 'ambicao');
    const w = G.Wars.active().find(x => x.side[C.A.id] && x.side[C.B.id]); if (!w) return { err: 'a guerra não começou' };
    const caps = C.hold(T3, C.A, C.B, w);
    G.Wars.onPeace(C.B, C.A, 'sem vencedores', null); if (r) { r.st = 'tregua'; r.truce = G.DAY_LEN * 3; }
    return { back: T3.fac === C.A.id, n: caps.length, free: C.freeOf(caps), own: C.own().filter(q => caps.some(v => q.msg.includes('#' + v.id))).length, line: C.line(8, new RegExp(T3.name)) };
  });
  ok('3 a paz branca devolve a cidade ocupada: os cativos do seu povo ficam livres', !r3.err && r3.back && r3.free === r3.n && !r3.own, JSON.stringify(r3));

  // 4. save and load: who is a captive stays so
  const r4 = await page.evaluate(() => {
    const n0 = [...G.S.villagers.values()].filter(v => v.captive).length;
    G.Save.apply(JSON.parse(G.Save.serialize()));
    const n1 = [...G.S.villagers.values()].filter(v => v.captive).length;
    QA.run(1, 50); const C = __C;
    return { n0, n1, own: C.own().length, left: QA.check().filter(e => e.sev <= 2 && !C.base.has(e.id + '|' + e.msg)).map(e => `${e.id}/S${e.sev}: ${e.msg}`).slice(0, 4) };
  });
  ok('4 salvar e carregar: quem é cativo continua igual', r4.n0 === r4.n1, `${r4.n0} → ${r4.n1}`);
  ok('4 verificador (nada de novo de S0 a S2; nenhum cativo do próprio povo)', !r4.left.length && !r4.own, r4.left.join(' · ') || 'limpo');

  // ------------------------------ an archipelago: the castaway who was a captive ------------------------------
  const r5 = await page.evaluate(() => {
    G.Main.newGame({ seed: 4131, type: 'arquipelago', size: 128, tribes: 4, temper: 'normal', clima: 'variado', relevo: 'suave' }); G.Main.mode = 'game'; G.UI.setSpeed(0);
    const S = G.S, W = G.W, C = __C; QA.run(2, 200);
    C.base = new Set(QA.check().filter(e => e.sev <= 2).map(e => e.id + '|' + e.msg));
    // (a town of A on a land where only A lives, and B anywhere else: the captive of B washes up beside home)
    const fs = G.Fac.all().filter(f => f.alive); let A = null, B = null, isle = null;
    for (const a of fs) for (const s of G.Fac.settlementsOf(a.id)) {
      if (isle || !C.adults(s).length) continue;
      if ([...S.settlements.values()].some(o => o.fac !== a.id && W.townsLinked(s, o))) continue;
      const b = fs.find(f => f !== a && G.Fac.settlementsOf(f.id).length); if (b) { A = a; B = b; isle = s; }
    }
    if (!isle) return { err: 'nenhuma cidade numa terra só do seu povo' };
    const v = C.adults(isle)[0]; G.Vg.endTask(v); G.War.enslave(v, A.id, isle.id); v.set = G.Fac.capitalOf(B.id).id; v.home = 0;
    let p = null; for (let k = 0; k < 40 && !p; k++) { const a = k * 0.7, r = 5 + k * 0.2; const x = isle.cx + Math.cos(a) * r, y = isle.cy + Math.sin(a) * r; if (W.walkableXY(x, y) && W.reachesTownXY(x, y, isle)) p = [x, y]; }
    p = p || [isle.cx + 0.5, isle.cy + 0.5];
    v.x = p[0]; v.y = p[1]; v.path = null; v.inside = 0;
    v.wrecked = { ship: 0, name: 'o barco', d: S.day, fac: B.id, exp: 0, x: v.x, y: v.y };
    QA.run(3, 50, () => !v.wrecked && !(v.task && v.task.type === 'naufrago'));
    const home = S.settlements.get(v.set);
    return { who: v.name, from: isle.name, captors: B.name, alive: S.villagers.has(v.id), wrecked: !!v.wrecked, captive: !!v.captive, ownFac: !!(v.captive && v.captive.from === G.Fac.idOfV(v)), lives: home ? home.name : '-', homeFac: home ? home.fac === A.id : false, line: C.line(40, new RegExp(v.name)),
      left: QA.check().filter(e => e.sev <= 2 && !C.base.has(e.id + '|' + e.msg)).map(e => `${e.id}/S${e.sev}: ${e.msg}`).slice(0, 4) };
  });
  if (r5.err) ok('5 o mundo do náufrago serve', false, r5.err);
  else {
    ok('5 o cativo que naufraga perto da sua cidade, numa terra sem cidade dos captores, chega em casa livre', r5.alive && !r5.wrecked && !r5.captive && r5.homeFac, JSON.stringify(r5));
    ok('5 verificador', !r5.left.length, r5.left.join(' · ') || 'limpo');
  }
  ok('sem erros de página nem de módulo', !errs.length && (await page.evaluate(() => JSON.stringify(G.modErr))) === '{}', errs.slice(0, 3).join(' || ') || 'nenhum');
  console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
