// civicos: o cenário dos prédios da vida comum (C2, Etapa 5) — o templo, o quartel, a cadeia, os banhos, o paço, os
// palácios e a feira — nos mundos prontos, provocados nos casos ruins: todos com registro e planta válida; o que cada um é
// para, em peças que o mundo conta (a imagem e o altar, as celas com palha atrás da grade e o carcereiro, a piscina e a
// fornalha, o assento do chefe, o trono, as bancas dos feirantes); a casca de longe a da planta (a feira, casca aberta:
// sem paredes nem telhado); salvar e carregar duas vezes, as mesmas plantas; um ano de salto; a ruína de cada tipo; o save
// antigo, sem registros. Nenhum erro de módulo.
//   node qa/civicos.js [mundo,mundo...]
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['qa/interiores-inv.js'] }); const In = G.Interiors;
const list = process.argv[2] ? process.argv[2].split(',') : ['metropole', 'mundial', 'mega', 'anos1000'];
const NEW = ['temple', 'quartel', 'cadeia', 'banhos', 'paco', 'palacio', 'grande_palacio', 'palacio_colossal', 'feira'];
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | civicos ${name} | ${info}`); if (!c) fails.push(name); };
const strip = o => { const x = Object.assign({}, o); delete x.key; return JSON.stringify(x); };
const print = p => JSON.stringify([p.fam, p.sig, p.shell, p.levels, p.items.map(i => [i.kind, i.x, i.z, i.ry, i.lv])]);
const civ = () => [...G.S.buildings.values()].filter(b => NEW.includes(b.type) || (b.type === 'ruin' && NEW.includes(b.origType) && b.ip));
// what each is for, in pieces the world counts
const FOR = {
  temple: p => (p.items.some(i => i.kind === 'idolo') && p.items.some(i => i.kind === 'altar' && i.spots.some(s => s.use === 'oficiar')) && p.items.some(i => i.kind === 'banco-fieis' || i.kind === 'esteira-oracao') ? null : 'sem a imagem, o altar ou o lugar dos fiéis'),
  quartel: p => (p.items.filter(i => i.kind === 'catre').length >= 4 && p.items.some(i => i.kind === 'armeiro') && p.items.some(i => i.kind === 'manequim') ? null : 'sem catres, armas ou o poste de treino'),
  cadeia: p => { const cs = p.rooms.filter(m => m.fn === 'cela'); if (cs.length < G.BDEF.cadeia.cells) return `${cs.length} celas`; if (!cs.every(c => p.items.some(i => i.room === c.id && i.kind === 'palha') && p.doors.some(d => d.rooms.includes(c.id) && d.kind === 'grade'))) return 'uma cela sem palha ou sem grade'; return p.items.some(i => i.kind === 'mesa-escriba') ? null : 'sem a mesa do carcereiro'; },
  banhos: p => (p.items.some(i => i.kind === 'piscina' || i.kind === 'tina-banho') && p.items.some(i => i.kind === 'fornalha-banho') ? null : 'sem a água ou sem a fornalha'),
  paco: p => (p.items.some(i => i.kind === 'trono') ? null : 'sem o assento do chefe'),
  palacio: p => (p.items.some(i => i.kind === 'trono') && p.rooms.some(m => m.fn === 'aposento') ? null : 'sem o trono ou os aposentos'),
  feira: p => (p.shell.kind === 'aberta' && !p.walls.length && p.items.filter(i => i.kind === 'banca').length >= (G.BDEF.feira.jobs || 0) ? null : 'casca fechada ou bancas de menos'),
};
FOR.grande_palacio = FOR.palacio_colossal = FOR.palacio;
const check = (name) => {
  In.uncache(); const by = {}; let bad = 0, inval = 0, noRec = 0, shells = 0; const ex = [];
  for (const b of civ()) {
    by[b.type] = (by[b.type] || 0) + 1;
    if (!b.ip) { noRec++; continue; } if (b.type === 'ruin') continue;
    const s1 = In.shellOf(b); const p = In.plan(b);
    if (!p.ok) { inval++; if (ex.length < 4) ex.push(`#${b.id} ${b.type}/${b.ip.f}: ${(p.errs || []).slice(0, 2).join('; ')}`); continue; }
    if (!s1 || strip(s1) !== strip(In.shellOfPlan(p))) { shells++; if (ex.length < 4) ex.push(`#${b.id} ${b.type}: a casca de longe difere`); }
    const why = FOR[b.type] && FOR[b.type](p); if (why) { bad++; if (ex.length < 4) ex.push(`#${b.id} ${b.type}/${b.ip.f}: ${why}`); }
  }
  const n = Object.values(by).reduce((x, y) => x + y, 0);
  ok(name, n > 0 && !noRec && !inval && !bad && !shells && M.limpo(), `${n} prédios (${Object.entries(by).map(([t, k]) => t + ' ' + k).join(', ')}): ${noRec} sem registro, ${inval} plantas inválidas, ${bad} sem o que são, ${shells} cascas diferentes${ex.length ? ' — ' + ex.join(' · ') : ''}`);
  return by;
};
// the prisoners the world has (crime.js puts them in: v.jail): each one in his jail on the straw of one of its cells
const presos = (name) => {
  let n = 0, bad = 0; const ex = [];
  for (const v of G.S.villagers.values()) {
    if (!v.jail || v.inside !== v.jail) continue; const b = G.S.buildings.get(v.jail); if (!b || !b.ip || b.type !== 'cadeia') continue; n++;
    const pl = In.placeOf(v); const p = In.plan(b); const it = pl && p.items.find(i => i.id === pl.item); const room = it && p.rooms[it.room];
    if (!it || it.kind !== 'palha' || !room || room.fn !== 'cela') { bad++; if (ex.length < 3) ex.push(`${v.name}: ${it ? it.kind : 'nada'}`); }
  }
  if (n) ok(`${name} presos nas celas`, !bad, `${n} presos: ${bad} fora de uma cela${ex.length ? ' (' + ex.join(', ') + ')' : ''}`);
  return n;
};
// (the checker's own rules for the interiors — the records, a few plans each round, the prisoners on the straw of a cell)
const qa = name => { const bad = QA.check().filter(q => q.sys === 'int'); ok(`${name} verificador`, !bad.length, bad.length ? bad.slice(0, 4).map(q => `S${q.sev}: ${q.msg}`).join(' · ') : 'sem nada dos interiores'); };
const snap = () => { In.uncache(); const m = new Map(); for (const b of civ()) if (b.ip && b.type !== 'ruin') m.set(b.id, print(In.plan(b))); return m; };
const same = (a, b) => { let d = 0; for (const [id, s] of a) if (b.get(id) !== s) d++; return d + Math.abs(a.size - b.size); };
const seen = {};
for (const key of list) {
  M.pronto(key); const by = check(`${key} aberto`); for (const t in by) seen[t] = (seen[t] || 0) + by[t];
  seen.presos = (seen.presos || 0) + presos(`${key} aberto`); qa(`${key} aberto`);
  const s0 = snap(); M.salvarCarregar(); const s1 = snap(); M.salvarCarregar(); const s2 = snap();
  ok(`${key} salvar e carregar`, !same(s0, s1) && !same(s1, s2), `${s0.size} plantas: ${same(s0, s1)} diferentes depois de carregar, ${same(s1, s2)} depois de carregar de novo`);
  presos(`${key} carregado`);
  // ---- the ruin of one of each kind: the plan of the ruin (its ground storey broken low, its things rubble)
  {
    const done = []; G.inSim++;
    try { for (const t of NEW) { const b = civ().find(x => x.type === t && x.built && x.ip); if (!b) continue; G.Village.destroyBuilding(b, 'fire'); done.push(b); } } finally { G.inSim--; }
    In.uncache(); let bad = 0; const ex = [];
    for (const b of done) { const p = In.plan(b); const s = In.shellOf(b); if (!p || !p.ok || !p.ruin || p.shell.roof || !s || strip(s) !== strip(In.shellOfPlan(p)) || p.items.some(i => i.kind !== 'entulho')) { bad++; if (ex.length < 3) ex.push(`#${b.id} ${b.origType}: ${b.type}, planta ${p ? (p.ruin ? 'da ruína' : 'inteira') : 'nenhuma'}`); } }
    ok(`${key} ruínas`, done.length > 0 && !bad, `${done.length} prédios arruinados (um de cada tipo): ${bad} com a planta da ruína errada${ex.length ? ' (' + ex.join(', ') + ')' : ''}`);
  }
  M.saltar(1); check(`${key} um ano de salto`); presos(`${key} um ano de salto`); qa(`${key} um ano de salto`);
}
// ---- a palace of each size founded by hand where the land is free — the colossal one no ready world has —: its record from
// the day it is placed, its plan valid and what it is for, its shell the plan's, the same after a save, and its ruin
{
  M.pronto(list[0]); const S = G.S; const N = G.N; const made = [];
  const free = (x0, y0, w) => { for (let y = y0 - 1; y <= y0 + w; y++) for (let x = x0 - 1; x <= x0 + w; x++) { if (!G.W.inb(x, y)) return false; const i = G.W.idx(x, y); if (!G.W.walkable(i) || S.occ[i] || S.road[i]) return false; } return true; };
  const set = [...S.settlements.values()].find(t => t.fac && G.Fac.get(t.fac)) || [...S.settlements.values()][0];
  G.inSim++;
  try {
    for (const t of ['palacio', 'grande_palacio', 'palacio_colossal']) {
      const w = G.BDEF[t].w; let at = null;
      for (let y = 2; y < N - w - 2 && !at; y++) for (let x = 2; x < N - w - 2; x++) if (free(x, y, w)) { at = [x, y]; break; }
      if (at) made.push(G.Village.addBuilding(t, at[0], at[1], set.id, true));
    }
  } finally { G.inSim--; }
  In.uncache(); let bad = 0; const ex = [];
  for (const b of made) { const p = In.plan(b); const s = In.shellOf(b); const why = !b.ip ? 'sem registro' : !p.ok ? (p.errs || []).slice(0, 2).join('; ') : FOR[b.type](p) || (strip(s) !== strip(In.shellOfPlan(p)) ? 'a casca de longe difere' : null); if (why) { bad++; ex.push(`#${b.id} ${b.type}: ${why}`); } else ex.push(`#${b.id} ${b.type}/${b.ip.f}: ${p.rooms.length} cômodos, ${p.items.length} peças`); }
  const s0 = snap(); M.salvarCarregar(); const s1 = snap();
  ok('palácios fundados à mão', made.length === 3 && !bad && !same(s0, s1), `${made.length} de 3 fundados: ${ex.join(' · ')}; depois de salvar e carregar, ${same(s0, s1)} plantas diferentes`);
  for (const b of made) seen[b.type] = (seen[b.type] || 0) + 1;
}
// ---- the old save: the records taken out; loading gives each building one again, the same each time
{
  M.pronto(list[0]); const raw = JSON.parse(G.Save.serialize()); let n = 0;
  for (const b of raw.buildings || []) if (b && b.ip && NEW.includes(b.type)) { delete b.ip; n++; }
  const txt = JSON.stringify(raw); G.Save.apply(JSON.parse(txt)); const s1 = snap(); G.Save.apply(JSON.parse(txt)); const s2 = snap();
  ok('save antigo', n > 0 && civ().every(b => b.type === 'ruin' || b.ip) && !same(s1, s2), `${n} registros tirados; ao carregar, ${civ().filter(b => b.ip).length} com registro; carregado duas vezes: ${same(s1, s2)} plantas diferentes`);
}
ok('todos os tipos vistos', NEW.every(t => seen[t]), `nos mundos: ${NEW.map(t => t + ' ' + (seen[t] || 0)).join(', ')}; presos postos nas celas: ${seen.presos || 0}`);
console.log(`erros de módulo: ${JSON.stringify(G.modErr || {})}`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
