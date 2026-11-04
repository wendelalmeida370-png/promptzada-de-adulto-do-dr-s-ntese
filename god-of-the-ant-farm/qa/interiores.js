// interiores: o cenário dos interiores (C2), provocando a planta de propósito nos casos ruins — o mundo pronto aberto, o
// salto, salvar e carregar duas vezes no meio, a reforma, a ruína, o save antigo (sem registros) —, com o verificador dos
// interiores (qa/interiores-inv.js) e a regra de sempre: a casca de longe é a da planta; a planta é a mesma do mesmo
// registro, antes e depois de salvar; nenhuma planta inválida; nenhum erro de módulo ou de console.
//   node qa/interiores.js [mundo pronto] [anos]
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js'] }); const In = G.Interiors;
const key = process.argv[2] || 'cidade', anos = +(process.argv[3] || 1);
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | interiores ${name} | ${info}`); if (!c) fails.push(name); };
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const withIp = () => [...G.S.buildings.values()].filter(b => b.ip && In.TYPES[b.ip.t]);
// (what a plan is, for comparing two of them: its family, shell, structure and every piece where it stands)
const print = p => JSON.stringify([p.fam, p.sig, p.shell, p.levels, p.walls.length, p.holes, p.items.map(i => [i.kind, i.x, i.z, i.ry, i.lv])]);
const checkAll = (name) => {
  In.uncache(); let bad = 0, inval = 0, n = 0; const ex = [];
  for (const b of withIp()) { n++; const s1 = In.shellOf(b); const p = In.plan(b); if (!p.ok) { inval++; if (ex.length < 3) ex.push(`#${b.id} ${b.type}: ${(p.errs || []).slice(0, 1)}`); } if (!s1 || strip(s1) !== strip(In.shellOfPlan(p))) { bad++; if (ex.length < 3) ex.push(`#${b.id} ${b.type}: casca`); } }
  const q = QA.check().filter(x => x.sev <= 2);
  ok(name, !bad && !inval && !q.length && M.limpo(), `${n} prédios com planta: ${inval} inválidas, ${bad} cascas diferentes; verificador ${q.length ? q.slice(0, 3).map(x => `S${x.sev} ${x.sys}: ${x.msg}`).join(' · ') : 'limpo'}${ex.length ? ' — ' + ex.join(', ') : ''}${M.limpo() ? '' : ' — erros: ' + JSON.stringify(M.erros()).slice(0, 200)}`);
};
const snap = () => { In.uncache(); const m = new Map(); for (const b of withIp()) m.set(b.id, print(In.plan(b))); return m; };
const same = (a, b) => { let d = 0; for (const [id, s] of a) if (b.get(id) !== s) d++; return d + Math.abs(a.size - b.size); };

M.pronto(key);
checkAll(`${key} aberto`);
// ---- the table of places by the pump's line (T-432): a big plan's table, made a little at a time after its plan (the drawing's
// line, a few ms a frame), is the very table the step makes in one go — the Colosseum of 10, the palace of 6 and the Greek
// theatre of 8 put on the opened world for the proof only
{
  const S = G.S; const sig = t => JSON.stringify({ s: t.spots.map(e => [e.k, e.use, e.on, e.lv, e.x, e.z, e.ok, e.din, e.it.id || e.it.kind, e.q]), f: t.floor, l: t.lie, c: t.cells, e: t.entry, r: t.rows.length });
  const bs = [['maravilha', 'romano', 10, 'S'], ['palacio', 'romano', 6, 'E'], ['teatro', 'grego', 8, 'N']].map(([t, c, n, s], q) => {
    const rec = { v: 4, f: '', r: 0, t, u: In.TYPES[t].use, s, o: 0, c, e: 5, k: 'ae', cl: 't', fl: 0, d: 2, w: 1, pw: 0, h: [], m: 0, fx: [], dr: {}, n }; rec.f = In.familiesFor(rec).ok[0];
    const b = { id: 990001 + q, type: t, x: 3, y: 3, w: n, h: n, ip: rec, style: c, built: true, set: 0 }; S.buildings.set(b.id, b); return b; });
  In.untable(); for (const b of bs) In.want(b); let k = 0; for (; k < 20000 && (In.waiting() || In.waitingTables()); k++) In.pump(2);
  const byLine = bs.map(b => In.tableReady(b)); const a = bs.map(b => sig(In.table(b)));
  In.untable(); const z = bs.map(b => sig(In.table(b))); const n = bs.map(b => In.table(b).spots.length);
  for (const b of bs) S.buildings.delete(b.id); In.untable(); In.uncache();
  ok('a tabela pela fila (T-432)', byLine.every(Boolean) && a.every((x, i) => x === z[i]), `${bs.length} prédios grandes (${n.join(', ')} lugares): ${byLine.filter(Boolean).length} tabelas feitas pela fila em ${k} rodadas de 2 ms; ${a.filter((x, i) => x === z[i]).length} iguais à feita de uma vez`);
}
// ---- save and load, twice: the same records, the same plans
const s0 = snap(); M.salvarCarregar(); const s1 = snap(); M.salvarCarregar(); const s2 = snap();
ok('salvar e carregar duas vezes', !same(s0, s1) && !same(s1, s2), `${s0.size} plantas: ${same(s0, s1)} diferentes depois de carregar, ${same(s1, s2)} depois de carregar de novo`);
// ---- the world goes on: records founded, rebuilt, retyped; the plans follow
M.saltar(anos); checkAll(`${anos} ano(s) de salto`);
// ---- a renovation: the family changed by hand (as a god's work would), the record's count goes up, a new valid plan
{
  const b = withIp().find(x => x.type === 'house' && x.built); let info = 'sem casa';
  if (b) {
    const r0 = b.ip.r, f0 = b.ip.f; const alt = In.familiesFor(b.ip).ok.find(f => f !== f0);
    G.inSim++; let res; try { res = In.renovate(b, alt ? { fam: alt } : {}); } finally { G.inSim--; }
    In.uncache(); const p = In.plan(b); const s = In.shellOf(b);
    info = `#${b.id}: ${f0} → ${b.ip.f} (r ${r0} → ${b.ip.r}), ${res && res.ok ? 'feita' : 'recusada: ' + (res && res.why)}; planta ${p.ok ? 'válida' : 'inválida'}`;
    ok('reforma', !!(res && res.ok && b.ip.r === r0 + 1 && p.ok && s && strip(s) === strip(In.shellOfPlan(p))), info);
  } else ok('reforma', false, info);
}
// ---- a ruin: the building falls (as a fire, a meteor would leave it); the plan becomes the ruin of itself, open, valid
{
  const b = withIp().find(x => x.type === 'house' && x.built && x.id !== (withIp()[0] || {}).id); let info = 'sem casa';
  if (b) {
    G.inSim++; try { G.Village.destroyBuilding(b, 'fire'); } finally { G.inSim--; }
    In.uncache(); const p = In.plan(b); const s = In.shellOf(b);
    info = `#${b.id}: ${b.type} de ${b.origType}, planta ${p && p.ok ? 'válida' : 'inválida'}${p && p.ruin ? ' (ruína: ' + p.walls.length + ' paredes baixas, sem telhado)' : ''}`;
    ok('ruína', !!(p && p.ok && p.ruin && !p.shell.roof && s && strip(s) === strip(In.shellOfPlan(p))), info);
  } else ok('ruína', false, info);
}
// ---- an old save, from before the records: loaded, each building gets its record from what it is, the same each time
{
  const o = JSON.parse(G.Save.serialize()); let n = 0; for (const b of o.buildings || []) if (b.ip) { delete b.ip; n++; }
  const txt = JSON.stringify(o);
  G.Save.apply(JSON.parse(txt)); const a = snap(); G.Save.apply(JSON.parse(txt)); const b = snap();
  ok('save antigo', n > 0 && withIp().length >= n * 0.9 && !same(a, b), `${n} registros tirados; ao carregar, ${withIp().length} prédios com registro; carregado duas vezes: ${same(a, b)} plantas diferentes`);
  checkAll('save antigo verificado');
}
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
