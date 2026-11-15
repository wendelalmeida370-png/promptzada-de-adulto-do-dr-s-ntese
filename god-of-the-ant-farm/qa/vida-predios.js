// vida-predios: o cenário da vida dos prédios (§35), cada caso provocado de propósito, com um save no meio: a casa onde a
// família não cabe mais cresce (In.growFam: a família de planta da casca maior que deita mais gente, e o custo; a reforma
// pelo In.renovate, como a obra do C1 a fará no fim: a casca nova de longe, mais camas); a casa cuja
// família acaba fica vazia e, depois de In.LEFT dias, abandonada (a planta mostra: as coisas que a família leva foram
// embora; a casca de longe é a mesma); uma família que se muda para ela traz as suas coisas de volta (a planta é a da casa
// de novo); a casa cujo chefe morre fica com o herdeiro (o fato 'heranca' no registro); a casa abandonada que cai vira a
// ruína dela. O verificador limpo, nenhum erro de módulo.
//   node qa/vida-predios.js [mundo]
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js'] }); const In = G.Interiors;
const KEY = process.argv[2] || 'cidade';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | vida-predios ${name} | ${info}`); if (!c) fails.push(name); };
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const homes = () => [...G.S.buildings.values()].filter(b => b.built && b.ip && In.TYPES[b.type] && In.TYPES[b.type].use === 'casa');
const dwellers = b => [...G.S.villagers.values()].filter(v => v.home === b.id);
const lastFact = b => b.ip.h[b.ip.h.length - 1];
// (the turn of the day of the interiors alone, the world's day a step on: the case is provoked without the city around it
// moving a family into the empty house first — the world's own turn runs in the life tests)
const turn = () => { G.S.day++; G.inSim++; try { In.onNewDay(); } finally { G.inSim--; } };
const qa = name => { const bad = QA.check().filter(q => q.sys === 'int'); ok(`${name} verificador`, !bad.length, bad.length ? bad.slice(0, 4).map(q => `S${q.sev}: ${q.msg}`).join(' · ') : 'sem nada dos interiores'); };
M.pronto(KEY); In.uncache();
// ---- the house its household leaves: empty, then given up; the plan of the house left behind ----
{
  const b = homes().find(h => dwellers(h).length >= 2 && In.plan(h).ok && In.plan(h).items.some(it => In.ITEMS[it.kind].leva));
  const p0 = In.plan(b); const keep0 = p0.items.filter(it => !In.ITEMS[it.kind].leva).length, all0 = p0.items.length; const shell0 = strip(In.shellOf(b));
  turn(); // (the turn sees the household)
  G.inSim++; try { for (const v of dwellers(b)) G.Village.kill(v, 'old'); } finally { G.inSim--; }
  turn(); ok('vazia', b.ip.vz === G.S.day && !b.ip.ab, `#${b.id} ${b.ip.f}: ${dwellers(b).length} moradores; vazia desde o dia ${b.ip.vz}`);
  M.salvarCarregar(); const b1 = G.S.buildings.get(b.id); In.uncache();
  ok('salvar no meio', b1.ip.vz === b.ip.vz && b1.ip.nm === 0, `depois de salvar e carregar, vazia desde ${b1.ip.vz}`);
  for (let k = 0; k < In.LEFT; k++) turn();
  const p1 = In.plan(b1); const s1 = In.shellOf(b1);
  ok('abandonada', b1.ip.ab === G.S.day && lastFact(b1)[1] === 'abandono' && p1.left === 1 && p1.ok, `abandonada no dia ${b1.ip.ab}; o último fato: ${JSON.stringify(lastFact(b1))}`);
  ok('a planta da casa deixada', p1.items.length === keep0 && !p1.items.some(it => In.ITEMS[it.kind].leva) && p1.rooms.length === p0.rooms.length && p1.doors.length === p0.doors.length, `${all0} peças na casa vivida, ${p1.items.length} na deixada (ficaram as que não se levam: ${keep0}); os mesmos ${p1.rooms.length} cômodos e ${p1.doors.length} portas`);
  ok('a casca de longe', s1 && strip(s1) === shell0 && strip(In.shellOfPlan(p1)) === strip(s1), 'a mesma de quando era vivida, e a mesma da planta da casa deixada');
  qa('abandonada');
  // ---- a household moves in: its things back, the house's own plan ----
  const v = [...G.S.villagers.values()].find(o => o.age >= 18 && o.home !== b1.id && o.set === b1.set) || [...G.S.villagers.values()].find(o => o.age >= 18);
  v.home = b1.id; turn();
  const p2 = In.plan(b1);
  ok('ocupada de novo', !b1.ip.ab && !b1.ip.vz && lastFact(b1)[1] === 'morada' && !p2.left && JSON.stringify(p2.items.map(i => [i.kind, i.x, i.z])) === JSON.stringify(p0.items.map(i => [i.kind, i.x, i.z])), `${v.name} mudou-se: ${p2.items.length} peças, as mesmas da casa de antes; o último fato ${JSON.stringify(lastFact(b1))}`);
  // ---- the house given up again, and fallen: the ruin of the house ----
  v.home = 0; turn(); for (let k = 0; k < In.LEFT; k++) turn();
  G.inSim++; try { G.Village.destroyBuilding(b1, 'fire'); } finally { G.inSim--; }
  In.uncache(); const p3 = In.plan(b1); const s3 = In.shellOf(b1);
  ok('a ruína', b1.type === 'ruin' && p3 && p3.ruin && !p3.left && s3 && strip(s3) === strip(In.shellOfPlan(p3)), `#${b1.id}: ${b1.type}, a planta da ruína (${p3 ? p3.items.length : 0} montes de entulho); os fatos: ${b1.ip.h.map(f => f[1]).join(', ')}`);
}
// ---- the house that grows: more people than beds; where it grows, what it costs, the renovation (C1's work calls it) ----
{
  let b = null, g = null;
  for (const h of homes()) { const p = In.plan(h); if (!p.ok || p.left) continue; if (In.growFam(h)) { b = h; break; } }
  if (!b) ok('a casa que cresce', false, 'nenhuma casa com para onde crescer');
  else {
    const p0 = In.plan(b); const s0 = strip(In.shellOf(b)); const r0 = b.ip.r, f0 = b.ip.f;
    // (the household grows past the beds: people from the town move in)
    for (const v of [...G.S.villagers.values()].filter(o => o.home !== b.id && o.set === b.set).slice(0, Math.max(1, p0.cap.places + 1 - dwellers(b).length))) v.home = b.id;
    const crowd = dwellers(b).length; g = In.growFam(b);
    ok('para onde cresce', g.fam !== f0 && g.places > g.now && g.floor > g.floor0 && Object.keys(g.cost).length > 0 && g.work > 0, `#${b.id} ${f0} (${g.now} camas, ${g.floor0} m²) → ${g.fam} (${g.places} camas, ${g.floor} m²): ${g.why}; custa ${JSON.stringify(g.cost)} e ${g.work} de trabalho; moram ${crowd}`);
    M.salvarCarregar(); In.uncache(); const b1 = G.S.buildings.get(b.id);
    const g1 = In.growFam(b1, g.want); ok('a mesma resposta depois de carregar', JSON.stringify(g1) === JSON.stringify(g), g1 ? `${g1.fam}, ${g1.places} camas${JSON.stringify(g1) === JSON.stringify(g) ? '' : ' — antes ' + JSON.stringify(g) + ', depois ' + JSON.stringify(g1)}` : 'nada');
    G.inSim++; let rr; try { rr = In.renovate(b1, { fam: g.fam }); } finally { G.inSim--; }
    const p1 = In.plan(b1); const s1 = In.shellOf(b1);
    ok('a reforma', rr.ok && b1.ip.f === g.fam && b1.ip.r === r0 + 1 && lastFact(b1)[1] === 'reforma' && lastFact(b1)[2] === g.fam, `${JSON.stringify(rr)}; o registro: ${b1.ip.f}, reforma ${b1.ip.r}; o último fato ${JSON.stringify(lastFact(b1))}`);
    ok('a planta reformada', p1.ok && p1.fam === g.fam && p1.cap.places === g.places && !p1.short, `${p1.cap.places} camas (eram ${p0.cap.places}), ${p1.rooms.length} cômodos (eram ${p0.rooms.length}), ${p1.levels.length} pisos (eram ${p0.levels.length})`);
    ok('a casca nova', s1 && strip(s1) !== s0 && strip(s1) === strip(In.shellOfPlan(p1)), 'de longe, a casa mudou, e a casca de longe é a da planta nova');
    qa('reformada');
  }
}
// ---- the heir: the head of a house dies, his partner or child stays — the house is theirs, the record says so ----
{
  const pick = () => {
    for (const b of homes()) {
      const ds = dwellers(b).filter(v => v.age >= 16).sort((x, y) => y.age - x.age || x.id - y.id); if (ds.length < 2) continue;
      const head = ds[0]; const heir = ds.find(v => v !== head && (v.mother === head.id || v.father === head.id || head.partner === v.id)); if (heir) return [b, head, heir];
    }
    return [];
  };
  const [b, head, heir] = pick();
  if (!b) ok('herança', false, 'nenhuma casa com chefe e herdeiro no mundo');
  else {
    turn(); // (the turn knows the head)
    const was = b.ip.hh;
    G.inSim++; try { G.Village.kill(head, 'old'); } finally { G.inSim--; }
    M.salvarCarregar(); In.uncache(); const b1 = G.S.buildings.get(b.id);
    turn();
    const f = lastFact(b1); const ds = dwellers(b1).filter(v => v.age >= 16).sort((x, y) => y.age - x.age || x.id - y.id);
    ok('herança', was === head.id && f[1] === 'heranca' && b1.ip.hh === ds[0].id && f[2] === ds[0].name + ' de ' + head.name, `#${b.id}: ${head.name} morreu (o chefe era ${was === head.id ? 'ele' : was}); o último fato ${JSON.stringify(f)}; a casa fica com ${ds[0].name}`);
    ok('a planta da casa herdada', In.plan(b1).ok && !In.plan(b1).left, `${In.plan(b1).items.length} peças: as mesmas, a família continua`);
  }
}
// ---- the whole world through the save, twice: the same records ----
{
  const recs = () => JSON.stringify([...G.S.buildings.values()].filter(b => b.ip).map(b => [b.id, b.ip]));
  const r0 = recs(); M.salvarCarregar(); const r1 = recs(); M.salvarCarregar(); const r2 = recs();
  ok('salvar e carregar', r0 === r1 && r1 === r2, `${[...G.S.buildings.values()].filter(b => b.ip).length} registros iguais depois de duas idas e voltas`);
  qa('no fim');
}
console.log(`erros de módulo: ${JSON.stringify(G.modErr || {})}`);
const clean = M.limpo(); if (!clean) fails.push('limpo');
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
