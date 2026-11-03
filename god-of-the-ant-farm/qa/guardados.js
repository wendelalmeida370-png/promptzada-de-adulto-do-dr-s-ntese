// guardados: o que um prédio guarda quando ele sai do mundo (L-377) — a despensa, as moedas e a arca de uma casa, a
// prateleira de um prédio de trabalho — sai com ele pelo livro-razão, e uma ruína não guarda nada. No mundo pronto «cidade»,
// em Node:   node qa/guardados.js [mundo]
//  g1 a casa que cai (o deus a derruba): o que ela guardava se perde com ela, pelo livro («ruina»); a ruína não guarda nada, e
//     limpa não leva mais nada
//  g2 a oficina que cai: a prateleira dela, pelo livro («ruina»; a porta do L-245, agora a do village.js)
//  g3 a cidade deixada ao vento: as casas e as prateleiras, pelo livro («abandono»); as ruínas não guardam nada
//  g4 a guarda fecha o mercado clandestino (a segunda batida): a mercadoria da prateleira volta ao armazém do povo
//     («apreendido»), e o que não cabe nele se perde pelo livro, como na porta das entregas («sem-lugar») — nada some
//  g5 um save no meio: a ruína carregada continua sem nada, e o livro do que se perdeu vai junto
//  g6 o verificador vê uma ruína com coisas dentro (a mão do teste) — S2
//  g7 a obra da cidade que derruba o bairro velho: as moedas da casa vão ao bolso do mais velho, e a despensa e a arca, da
//     família e não do povo (D-059), vêm abaixo com a casa pelo livro («obra-da-cidade»)
//  g8 a carga marcada para um prédio de trabalho que cai no caminho: vai ao estoque do povo pelo livro, e a ruína não guarda
//     nada (L-462: a ruína era uma prateleira para o depósito)
//  e nenhum erro de módulo nem aviso no console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/oficio-inv.js'] });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | guardados ${name} | ${info}`); if (!c) fails.push(name); };
const D = G.Depot, V = G.Village, E = G.Eco;
const r2 = x => Math.round(x * 100) / 100;
const lines = []; D.onMove.push(e => lines.push(e));
let S;
M.pronto(process.argv[2] || 'cidade'); S = G.S; M.viver(1); G.inSim = Math.max(G.inSim || 0, 1);
// (what the ruin rule says now — QA.ruina, from oficio-inv.js —; and every S2 of the activities and the numbers)
const ruins = () => { const out = []; QA.ruina((sys, sev, msg) => out.push(`S${sev} ${msg}`), S); return out; };
const bad = () => QA.check().filter(q => q.sev <= 2 && (q.sys === 'act' || q.sys === 'nan')).map(q => q.msg);
const out = (ref, L0, code) => lines.slice(L0).filter(e => e[3] === ref && (!code || e[8] === code));
const sum = (L, k) => r2(L.filter(e => e[5] === k).reduce((a, e) => a + e[6], 0));
const housing = b => !!(G.BDEF[b.type] && G.BDEF[b.type].housing);
const work = b => b.built && b.type !== 'ruin' && !housing(b) && !['farm', 'campfire', 'cemetery', 'mercado_negro'].includes(b.type);
const bySize = () => [...S.settlements.values()].sort((a, b) => V.pop(a.id) - V.pop(b.id) || a.id - b.id);
const clear = b => { const r = S.buildings.get(b.id); if (r && r.type === 'ruin') { r.ruinT = 0; M.viver(1.5); } };
// the test's hand: things kept in a house — in its pantry, on its floor (the furniture's room aside) — and coins
const fill = h => { D.make('h:' + h.id, 'food', 3, { code: 'teste', floor: true }); D.make('h:' + h.id, 'tecido', 2, { code: 'teste', floor: true }); D.make('h:' + h.id, 'moedas', 1.5, { code: 'teste' }); return D.list('h:' + h.id); };
const big = bySize().reverse()[0];

// ---------------- g1 the house that falls ----------------
let ruinId = 0, keptRuina = 0;
{
  const h = [...S.buildings.values()].filter(b => b.set === big.id && b.built && housing(b) && b.type !== 'ruin').sort((p, q) => p.id - q.id)[0];
  if (!h) ok('g1 a casa que cai', false, `${big.name} sem casa`);
  else {
    const had = fill(h); const L0 = lines.length;
    V.destroyBuilding(h, 'teste');
    const gone = out('h:' + h.id, L0, 'ruina'); const r1 = ruins().filter(m => m.includes('#' + h.id + ' '));
    const L1 = lines.length; clear(h); const after = lines.slice(L1).filter(e => e[3] === 'h:' + h.id || e[3] === 'b:' + h.id);
    ruinId = h.id; keptRuina = gone.length;
    const each = Object.keys(had).every(k => Math.abs(sum(gone, k) - had[k]) < 0.01);
    ok('g1 a casa que cai', each && !r1.length && !after.length && !bad().length,
      `${V.buildName(h)} #${h.id} de ${big.name} guardava ${JSON.stringify(had)}: caiu e saiu pelo livro ${JSON.stringify(Object.fromEntries(Object.keys(had).map(k => [k, sum(gone, k)])))} («ruina»); a ruína ${r1.length ? 'GUARDA: ' + r1[0] : 'não guarda nada'}; limpa, ${after.length ? 'MAIS linhas: ' + JSON.stringify(after.map(e => [e[5], e[6], e[8]])) : 'nada mais'}`);
  }
}
// ---------------- g2 the workshop that falls ----------------
{
  const b = [...S.buildings.values()].filter(x => x.set === big.id && work(x)).sort((p, q) => p.id - q.id)[0];
  if (!b) ok('g2 a oficina que cai', false, `${big.name} sem prédio de trabalho de pé`);
  else {
    D.make('b:' + b.id, 'tecido', 3, { code: 'teste' }); const had = D.list('b:' + b.id); const L0 = lines.length;
    V.destroyBuilding(b, 'teste');
    const gone = out('b:' + b.id, L0, 'ruina'); const r1 = ruins().filter(m => m.includes('#' + b.id + ' '));
    const each = Object.keys(had).every(k => Math.abs(sum(gone, k) - had[k]) < 0.01);
    ok('g2 a oficina que cai', each && !r1.length && !bad().length, `${V.buildName(b)} #${b.id} com ${JSON.stringify(had)} na prateleira: caiu e saiu pelo livro ${JSON.stringify(Object.fromEntries(Object.keys(had).map(k => [k, sum(gone, k)])))}; a ruína ${r1.length ? 'GUARDA: ' + r1[0] : 'não guarda nada'}`);
  }
}
// ---------------- g3 a town left to the wind ----------------
{
  const s = bySize().find(t => t.id !== big.id && [...S.buildings.values()].some(b => b.set === t.id && b.built && housing(b)) && [...S.buildings.values()].some(b => b.set === t.id && work(b)));
  if (!s) ok('g3 a cidade deixada ao vento', false, 'nenhuma outra cidade com casa e prédio de trabalho');
  else {
    const h = [...S.buildings.values()].filter(b => b.set === s.id && b.built && housing(b)).sort((p, q) => p.id - q.id)[0];
    const w = [...S.buildings.values()].filter(b => b.set === s.id && work(b)).sort((p, q) => p.id - q.id)[0];
    const hadH = fill(h); D.make('b:' + w.id, 'tecido', 3, { code: 'teste' }); const hadW = D.list('b:' + w.id); const L0 = lines.length;
    for (const v of [...S.villagers.values()]) if (v.set === s.id) V.kill(v, 'teste', true); // (the town empty: nobody left)
    V.abandon(s);
    const goneH = out('h:' + h.id, L0), goneW = out('b:' + w.id, L0, 'abandono');
    const r1 = ruins().filter(m => m.includes('#' + h.id + ' ') || m.includes('#' + w.id + ' '));
    const L1 = lines.length; clear(h); clear(w); const after = lines.slice(L1).filter(e => ['h:' + h.id, 'b:' + h.id, 'b:' + w.id].includes(e[3]));
    const eachH = Object.keys(hadH).every(k => Math.abs(sum(goneH, k) - hadH[k]) < 0.01), eachW = Object.keys(hadW).every(k => Math.abs(sum(goneW, k) - hadW[k]) < 0.01);
    ok('g3 a cidade deixada ao vento', eachH && eachW && !r1.length && !after.length && !bad().length,
      `${s.name}, deixada ao vento: ${V.buildName(h)} #${h.id} com ${JSON.stringify(hadH)} → pelo livro ${JSON.stringify(Object.fromEntries(Object.keys(hadH).map(k => [k, sum(goneH, k)])))} (${[...new Set(goneH.map(e => e[8]))].join(', ') || 'nada'}); ${V.buildName({ type: w.origType || w.type, style: w.style })} #${w.id} com ${JSON.stringify(hadW)} → ${JSON.stringify(Object.fromEntries(Object.keys(hadW).map(k => [k, sum(goneW, k)])))} («abandono»); as ruínas ${r1.length ? 'GUARDAM: ' + r1[0] : 'não guardam nada'}; limpas, ${after.length ? 'MAIS linhas' : 'nada mais'}`);
  }
}
// ---------------- g4 the guard closes the black market ----------------
{
  const set = big; const f = G.Fac.get(set.fac);
  let shop = [...S.buildings.values()].find(b => b.type === 'mercado_negro' && b.set === set.id && b.built);
  if (!shop) { const pos = V.findSite(set, 'mercado_negro'); if (pos) shop = V.addBuilding('mercado_negro', pos[0], pos[1], set.id, true); }
  const crooks = [...S.villagers.values()].filter(v => v.set === set.id && !v.captive && !v.jail && v.age >= 18 && v.age < 55 && v.role !== 'guerreiro' && !G.Fac.all().some(q => q.leader === v.id)).sort((a, b) => a.id - b.id).slice(0, 2);
  const guard = [...S.villagers.values()].find(v => v.set === set.id && v.role === 'guerreiro' && !v.captive) || [...S.villagers.values()].find(v => v.set === set.id && !crooks.includes(v) && v.age >= 18 && !v.captive);
  if (!shop || crooks.length < 2 || !guard || !f) ok('g4 a guarda fecha o mercado clandestino', false, `${set.name}: ${!shop ? 'sem lugar para o mercado' : crooks.length < 2 ? 'sem dois contrabandistas' : 'sem guarda'}`);
  else {
    for (const v of crooks) { v.role = 'contrabandista'; v.job = shop.id; }
    D.make('b:' + shop.id, 'tecido', 3, { code: 'teste' }); D.make('b:' + shop.id, 'ceramica', 2, { code: 'teste' }); const had = D.list('b:' + shop.id);
    const store0 = Object.fromEntries(Object.keys(had).map(k => [k, D.get('f:' + f.id, k)])); const L0 = lines.length;
    // (the execution a cruel ruler orders for smuggling is the world's, and not the case: a fine here)
    const ex = G.Politics.execute; G.Politics.execute = () => false;
    for (const o of crooks) E.arrest(o, guard);
    G.Politics.execute = ex;
    const closed = !S.buildings.has(shop.id); const seized = out('b:' + shop.id, L0).filter(e => e[8] === 'apreendido' || e[8] === 'sem-lugar');
    const toStore = seized.filter(e => e[4] === 'f:' + f.id), lost = seized.filter(e => e[8] === 'sem-lugar');
    const each = Object.keys(had).every(k => Math.abs(sum(seized, k) - had[k]) < 0.01);
    const inStore = Object.keys(had).every(k => Math.abs(D.get('f:' + f.id, k) - store0[k] - sum(toStore, k)) < 0.01);
    ok('g4 a guarda fecha o mercado clandestino', closed && each && inStore && !bad().length,
      `${set.name}: duas batidas e o mercado clandestino #${shop.id} ${closed ? 'fechado' : 'NÃO fechou'}; a prateleira ${JSON.stringify(had)} → ao armazém ${JSON.stringify(Object.fromEntries(Object.keys(had).map(k => [k, sum(toStore, k)])))} («apreendido»)${lost.length ? `; sem lugar no armazém, perdido pelo livro ${JSON.stringify(Object.fromEntries(Object.keys(had).map(k => [k, sum(lost, k)])))}` : ''}; o armazém ${inStore ? 'recebeu o que o livro diz' : 'NÃO bate com o livro'}`);
  }
}
// ---------------- g5 a save in the middle ----------------
{
  // (a ruin of its own, the god's hand again, not cleared: the g1's is gone — the ruins are cleared within the second and a
  // half the g1 waits, in the worlds of the generation 7, T-267)
  { const h = [...S.buildings.values()].filter(b => b.set === big.id && b.built && housing(b) && b.type !== 'ruin').sort((p, q) => p.id - q.id)[0]; if (h) { fill(h); V.destroyBuilding(h, 'teste'); ruinId = h.id; } }
  const r = ruinId && S.buildings.get(ruinId);
  if (!r) ok('g5 save no meio', false, 'sem uma casa para a ruína');
  else {
    const n0 = (S.ledger || []).filter(e => e[3] === 'h:' + ruinId && e[8] === 'ruina').length;
    M.salvarCarregar(); S = G.S;
    const r2b = S.buildings.get(ruinId); const n1 = (S.ledger || []).filter(e => e[3] === 'h:' + ruinId && e[8] === 'ruina').length; const r1 = ruins();
    ok('g5 save no meio', !!r2b && r2b.type === 'ruin' && !r1.length && n1 === n0 && !bad().length, `a ruína #${ruinId} carregada: ${r2b ? r2b.type : 'SUMIU'}, ${r1.length ? 'GUARDA: ' + r1[0] : 'sem nada'}; as linhas do que se perdeu nela: ${n0} antes do save, ${n1} depois`);
  }
}
// ---------------- g6 the checker sees a ruin with things in it ----------------
{
  const r = ruinId && S.buildings.get(ruinId);
  if (!r) ok('g6 o verificador vê', false, 'sem uma casa para a ruína');
  else {
    const clean0 = ruins().length; r.inv = Object.assign(r.inv || {}, { tecido: 1 }); r.pantry = 2; // (the test's hand: things left in a ruin)
    const saw = ruins(); r.inv.tecido = 0; r.pantry = 0; const clean1 = ruins().length;
    ok('g6 o verificador vê', !clean0 && saw.length === 1 && saw[0].startsWith('S2') && !clean1, `antes ${clean0}; com 1 de tecido e 2 de comida na ruína #${ruinId}: ${saw[0] || 'NADA'}; depois ${clean1}`);
  }
}
// ---------------- g7 the city's work pulls the old quarter down ----------------
{
  const h = [...S.buildings.values()].filter(b => b.set === big.id && b.built && housing(b) && b.type !== 'ruin' && b.id !== ruinId).sort((p, q) => p.id - q.id)[0];
  if (!h) ok('g7 o bairro velho', false, `${big.name} sem outra casa`);
  else {
    const had = fill(h); const fam = [...S.villagers.values()].filter(v => v.home === h.id).sort((a, b) => b.age - a.age || a.id - b.id); const L0 = lines.length;
    const w = V.startProject(big, 'temple', Object.assign([h.x, h.y], { demolish: [h.id] }));
    const gone = out('h:' + h.id, L0); const coins = gone.filter(e => e[5] === 'moedas'), goods = gone.filter(e => e[5] !== 'moedas' && e[8] === 'obra-da-cidade');
    const purse = fam.length ? 'p:' + fam[0].id : 'f:' + big.fac;
    const each = Object.keys(had).filter(k => k !== 'moedas').every(k => Math.abs(sum(goods, k) - had[k]) < 0.01);
    const coinOk = Math.abs(sum(coins, 'moedas') - had.moedas) < 0.01 && coins.every(e => e[4] === purse);
    ok('g7 o bairro velho', !!w && !S.buildings.has(h.id) && each && coinOk && !bad().length,
      `${V.buildName(h)} #${h.id} de ${big.name} derrubada para ${w ? V.buildName(w).toLowerCase() + ' #' + w.id : 'NADA'}: as moedas (${had.moedas}) ${coinOk ? 'ao bolso de ' + (fam[0] ? fam[0].name : 'o povo') : 'NÃO como devia: ' + JSON.stringify(coins.map(e => [e[4], e[6]]))}; a despensa e a arca ${JSON.stringify(Object.fromEntries(Object.keys(had).filter(k => k !== 'moedas').map(k => [k, had[k]])))} → pelo livro ${JSON.stringify(Object.fromEntries(Object.keys(had).filter(k => k !== 'moedas').map(k => [k, sum(goods, k)])))} («obra-da-cidade»)`);
  }
}
// ---------------- g8 a load on its way to a building that falls (L-462) ----------------
// (a porter with a load marked for a work building — the clay of a pottery's batch, goods for its shelf — when the building
// falls: the load goes to the people's store, in the ledger, and the ruin keeps nothing. In the caos 13 of the closing's
// regression, with the L-461: the lava brought the pottery #1610 down, and 18 s later a porter put the 2 of clay of its batch
// into the ruin («entrega»), where they stayed unwritten — the ruin was a shelf to the depot, as a house's ruin is not)
{
  const b = [...S.buildings.values()].filter(x => x.set === big.id && work(x)).sort((p, q) => p.id - q.id)[0];
  const v = b && [...S.villagers.values()].filter(o => o.set === big.id && o.age >= 18 && o.age < 55 && o.hp > 50 && !o.captive && !o.aboard && !o.jail && !o.ug && !o.held && !o.air && !o.inside && !(o.carry && o.carry.n > 1e-6) && !(o.task && (o.task.pri || 0) >= 1.5) && !(S.avatar && S.avatar.id === o.id) && !(G.Expe && G.Expe.memberOf(o.id)) && G.W.reaches(o, ...V.frontTile(b))).sort((p, q) => p.id - q.id)[0];
  if (!b || !v) ok('g8 a carga a caminho de um prédio que caiu', false, `${big.name}: ${!b ? 'sem prédio de trabalho de pé' : 'ninguém livre que chegue a ele'}`);
  else {
    G.Vg.endTask(v); const put = D.make('v:' + v.id, 'tecido', 2, { code: 'teste', to: 'b:' + b.id }); G.Vg.setTask(v, { type: 'carga', to: 'b:' + b.id, pri: 1, st: 0 });
    M.viver(0.5); const L0 = lines.length;
    V.destroyBuilding(b, 'teste');
    // (the world lives until the hands are empty, the ruin looked at every step)
    let kept = '', k = 0; for (; k < 900 && v.carry && v.carry.n > 1e-6 && S.villagers.has(v.id); k++) { M.viver(0.1); const r = ruins().find(m => m.includes('#' + b.id + ' ')); if (r && !kept) kept = r; }
    const went = out('v:' + v.id, L0); const to = went.map(e => `${e[8]} ${e[6]} para ${e[4]}`).join(', ');
    const store = 'f:' + G.Fac.idOfV(v); const home = went.filter(e => e[4] === store);
    ok('g8 a carga a caminho de um prédio que caiu', put.ok && !kept && !(v.carry && v.carry.n > 1e-6) && Math.abs(sum(home, 'tecido') - 2) < 0.01 && !went.some(e => e[4] === 'b:' + b.id) && !bad().length,
      `${v.name} levando 2 de tecido para ${V.buildName(b).toLowerCase()} #${b.id}, que caiu no caminho: ${kept ? 'a ruína GUARDA: ' + kept : 'a ruína não guarda nada'}; em ${(k / 10).toFixed(1)} s a carga ${v.carry && v.carry.n > 1e-6 ? `AINDA nas mãos (${v.carry.n} de ${v.carry.k}, para ${v.carry.to})` : `saiu das mãos pelo livro: ${to || 'NENHUMA linha'}`}`);
  }
}
const err = M.erros(); ok('erros', !Object.keys(err.mod || {}).length && !err.console.length, JSON.stringify(err.mod) + ' ' + err.console.slice(0, 3).join(' | '));
console.log(fails.length ? `GUARDADOS: FALHOU (${fails.join(', ')})` : 'GUARDADOS: ok');
process.exit(fails.length ? 1 : 0);
