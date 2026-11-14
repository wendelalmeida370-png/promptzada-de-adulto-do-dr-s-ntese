// aluguel-poupa: node qa/aluguel-poupa.js — a família que junta para a casa nova e aluga uma (L-696). A decisão da família
// (G.Casa.order) limpa a marca de juntar (h.poupa) da casa de onde ela sai quando compra a casa vazia do povo ou levanta uma
// nova; no aluguel, não limpava: a casa de antes ficava com a marca de quem já não mora lá (o K.saving a ignora, mas ela vai
// no save), e um «deixar de lado» do corpo depois fazia o verificador acusar (S3 «deixou a casa nova para depois e continua
// juntando para ela»). No mundo pronto «metropole» (ou no seguinte que tenha a premissa), dois segundos de mundo vividos e o
// dia de cada cidade de moeda:
// a1 uma família que junta e pode alugar aluga: a casa de antes fica sem a marca da família;
// a2 o mesmo com um save no meio (a marca vai no save): carregado, a família aluga, e a casa de antes fica sem a marca;
// a3 a família deixa a casa nova de lado depois de alugar (o pedido das mãos do corpo, K.giveUp): o verificador limpo dessa regra;
// e o verificador limpo (S0–S2), sem erro de módulo.
// A premissa (uma família que junta e pode alugar agora) é procurada nos mundos prontos, a metrópole primeiro. Na geração 20
// nenhum a tem: nas cidades com casas para alugar, quem precisa de casa já é de aluguel ou não tem as moedas de três dias de
// aluguel. Então a mão da prova dá essas moedas a uma família que junta numa cidade com uma casa para alugar que lhe caberia,
// só sem elas — o salário de uns dias, como o mundo daria com o tempo (T-1000).
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | aluguel-poupa ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const bad = () => QA.check().filter(q => q.sev <= 2).map(q => `[S${q.sev}] ${q.msg}`);
const s3 = () => QA.check().filter(q => q.sys === 'act' && /deixou a casa nova para depois e continua juntando/.test(q.msg)).map(q => `S${q.sev} ${q.msg}`);
// (the premise in the ready worlds as the game forms them, the metrópole first — the molde of escala.js and morar-palacio.js)
const MUNDOS = ['metropole', 'mundial', 'mega', 'cidade'];
function setup() { let r = null; for (const w of MUNDOS) { r = setupIn(w); if (r.o) break; } return r; }
function setupIn(w) {
  M.pronto(w); M.viver(2); const S = G.S, K = G.Casa;
  const coin = id => { const t = S.settlements.get(id); return !!t && G.Eco.coinage(t.fac); };
  for (const t of [...S.settlements.values()].filter(t => coin(t.id)).sort((a, c) => a.id - c.id)) god(() => K.day(t));
  const fam = o => K.family(o).map(m => m.id);
  const saves = o => { const h = S.buildings.get(o.home); return !!(h && h.poupa && fam(o).includes(h.poupa.by)); };
  // (a family saving for a house of its own that could rent one now — by the rule, never by name)
  const L = [...S.villagers.values()].filter(o => coin(o.set) && o.age >= 18 && K.need(o) && !K.waiting(o) && !K.gaveUp(o) && o.home && S.buildings.get(o.home) && saves(o)).sort((a, c) => a.id - c.id);
  let o = L.find(q => K.can(q).lease) || null, how = '';
  // (none: a family saving in a town with a house to let that would take it — the plan's — short only of the coins of three days
  // of rent, and still short of the price of a house, with no empty house of the people's given on its road; the test's hand
  // gives it those coins, in the ledger, as some days of wages would. In the generation 20 the families in need of the towns with
  // houses to let rent already or have less than that: «nenhuma família juntando que possa alugar (juntando: 87)», T-1000)
  if (!o) {
    const c = L.map(q => { const set = S.settlements.get(q.set), why = K.need(q); return { q, set, why, plan: K.plan(q, null, set, null, why), has: K.savings(q) }; })
      .find(x => x.plan.lease && x.has + 1e-6 < x.plan.rent * 3 && x.plan.rent * 3 < x.plan.price && K.road(x.q, { set: x.set, plan: x.plan, why: x.why, now: true }).kind !== 'cede');
    if (c) {
      const n = Math.ceil((c.plan.rent * 3 - c.has) * 100) / 100; god(() => G.Depot.make('h:' + c.q.home, 'moedas', n, { code: 'teste' }));
      if (K.can(c.q).lease) { o = c.q; how = `a mão da prova deu ${n} moedas à casa (tinha ${Math.floor(c.has * 100) / 100}; três dias do aluguel da ${c.plan.lease.type}#${c.plan.lease.id}, ${c.plan.rent} ao dia)`; }
    }
  }
  return { L, o, fam, mundo: w, how };
}
// (the family rents; what is left in the house it left)
function rent(o, fam) {
  const S = G.S, K = G.Casa; const h0 = S.buildings.get(o.home); const by = h0.poupa && h0.poupa.by;
  const r = god(() => K.order(o, { now: true }));
  const left = h0.poupa && fam.includes(h0.poupa.by) ? h0.poupa : null;
  return { r, h0, by, left, now: S.buildings.get(G.S.villagers.get(o.id).home) };
}
{ // a1
  const { L, o, fam, mundo, how } = setup();
  if (!o) ok('a1', false, `nenhuma família juntando que possa alugar, nem só sem as moedas de três dias de aluguel (${MUNDOS.join(', ')}; juntando no último: ${L.length})`);
  else { const f = fam(o); const x = rent(o, f);
    ok('a1', !!x.r.ok && !!x.r.rented && !x.left, `${mundo}: ${o.name} #${o.id}${how ? ` (${how})` : ''}: ${x.r.ok && x.r.rented ? `alugou a ${x.now ? x.now.type + '#' + x.now.id : '?'}` : `NÃO alugou («${x.r.why || ''}»)`}; a casa de antes ${x.h0.type}#${x.h0.id}: ${x.left ? `AINDA com a marca ${JSON.stringify(x.left)}` : 'sem a marca da família'}`);
    // a3: let the new house go after renting — the checker of the house's rules clean
    const gave = god(() => G.Casa.giveUp(o)); M.viver(0.05);
    const s = s3(); ok('a3', !!gave && s.length === 0, `deixou de lado: ${gave && gave.ok ? 'sim' : `não (${JSON.stringify(gave)})`}; o verificador: ${s.join(' | ') || 'limpo'}`); }
}
{ // a2: saved and loaded with the marker on, then the same lease
  const { L, o, fam, mundo } = setup();
  if (!o) ok('a2', false, `nenhuma família juntando que possa alugar, nem só sem as moedas de três dias de aluguel (${MUNDOS.join(', ')}; juntando no último: ${L.length})`);
  else { const id = o.id, f = fam(o); const str = G.Save.serialize(); G.Save.apply(JSON.parse(str));
    const p = G.S.villagers.get(id); const x = p ? rent(p, f) : null;
    ok('a2', !!x && !!x.r.ok && !!x.r.rented && !x.left, x ? `${mundo}, carregado (${(str.length / 1e6).toFixed(1)} MB): ${x.r.ok && x.r.rented ? 'alugou' : `NÃO alugou («${x.r.why || ''}»)`}; a casa de antes: ${x.left ? `AINDA com a marca ${JSON.stringify(x.left)}` : 'sem a marca da família'}` : 'a pessoa sumiu no load'); }
}
M.viver(0.1); const b = bad(), me = Object.keys(G.modErr || {});
ok('verificador', b.length === 0 && !me.length, `${b.length ? b.slice(0, 4).join(' | ') : 'limpo (S0–S2)'}; erro de módulo: ${me.length ? JSON.stringify(G.modErr) : 'nenhum'}`);
console.log(fails.length ? `FALHARAM: ${fails.join(', ')}` : 'tudo passou');
process.exitCode = fails.length ? 1 : 0;
