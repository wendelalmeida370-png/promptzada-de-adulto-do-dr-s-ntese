// vira: node qa/vira.js — quando um povo muda de mãos ou acaba, no mundo pronto «guerra mundial»:
// 1 o guerreiro cuja cidade passa a outro povo no meio de um saque (uma secessão, uma conquista) sai do bando e volta para
//   casa — ninguém marcha com um bando que não o tem na lista (L-088);
// 2 morre a última alma de um povo: o povo acaba junto, não um minuto depois (L-090);
// 3 morre a última alma livre de um povo que tinha cativos nas suas cidades: os cativos ficam livres, e a cidade é deles;
// e o verificador fica limpo nos dois.
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
    // the smallest people of the world loses its people one by one
    const f = F.sort((a, b) => G.Fac.pop(a.id) - G.Fac.pop(b.id))[0];
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
  r.ok = r.ok && r2.ok && r3.ok;
  console.log(`${errs.length ? 'FALHOU' : 'PASSOU'} | sem erros | ${errs.slice(0, 2).join(' | ') || 'nenhum'}`);
  await browser.close(); process.exit(r.ok && !errs.length ? 0 : 1);
})();
