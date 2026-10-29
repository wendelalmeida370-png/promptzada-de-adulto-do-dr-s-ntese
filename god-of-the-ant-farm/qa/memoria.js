// L-072: a memória dos mortos (node ev.js seed tipo tamanho povos anos memoria.js). O registro esquece os estranhos
// depois de três gerações e guarda para sempre governantes, heróis, quem tem apelido, os grandes matadores e os pais e
// avós de quem está vivo; um cemitério cheio abre outro até a cidade ter os que o tamanho pede — depois o mais velho é
// reaproveitado (os ossos vão para o ossuário). Provocado de propósito: cem anos passados de uma vez, um save no meio,
// uma morte numa cidade de cemitérios cheios, velhos e novos, um corpo que chega a um cemitério que encheu no caminho,
// um cemitério sem cidade, o raio do deus.
const S = G.S, V = G.Village; const out = [], fails = [];
const bad = m => fails.push(m);
const memV = () => QA.check().filter(q => (q.sys === 'mem' || q.sys === 'fam') && q.sev <= 3).map(q => `S${q.sev} ${q.sys} ${q.msg}`);
const v0 = memV(); if (v0.length) bad('antes de tudo: ' + v0.slice(0, 3).join(' | '));
// ---- 1. a hundred years go by for the dead: who is forgotten, who stays
for (const d of S.dead.values()) { d.died = (d.died || 0) - 100; if (d.born !== undefined) d.born -= 100; }
for (const b of S.buildings.values()) if (b.type === 'cemetery' && b.last !== undefined) b.last -= 100;
const mk = o => { const W = G.S; const id = W.nextId++; const d = Object.assign({ id, name: 'Antigo' + id, g: 'm', born: W.day - 160, died: W.day - 110, age: 50, kids: [], cause: 'old', dead: true, traits: [], fac: 0 }, o); W.dead.set(id, d); return d; };
const strangers = Array.from({ length: 30 }, () => mk({}));
const notable = [mk({ reigned: 1 }), mk({ hero: true }), mk({ ep: 'bravo' }), mk({ kills: 6 })];
const recent = mk({ died: S.day - 10 });
const before = new Set(S.dead.keys());
const kin = new Set(); for (const v of S.villagers.values()) { if (v.widow) kin.add(v.widow); for (const id of [v.mother, v.father]) { if (!id) continue; kin.add(id); const p = G.person(id); if (p) { if (p.mother) kin.add(p.mother); if (p.father) kin.add(p.father); } } }
// (the same forgetting after a save and a load: the world that comes back forgets the same names)
const saved = G.Save.serialize();
const gone = V.forget();
const keep1 = [...S.dead.keys()].sort((a, b) => a - b).join(',');
for (const d of strangers) if (S.dead.has(d.id)) bad(`estranho de 110 anos ainda lembrado: ${d.name}`);
for (const d of notable) if (!S.dead.has(d.id)) bad(`${JSON.stringify({ reigned: d.reigned, hero: d.hero, ep: d.ep, kills: d.kills })} foi esquecido`);
if (!S.dead.has(recent.id)) bad('um morto de 10 anos foi esquecido');
for (const id of before) if (!S.dead.has(id) && kin.has(id)) bad(`pai/mãe/avô de alguém vivo esquecido: #${id}`);
let reasons = 0; for (const [id, d] of S.dead) if (S.day - d.died >= 80 && !kin.has(id) && !V.remembered(d)) reasons++;
if (reasons) bad(`${reasons} registro(s) velhos sem motivo para ficar`);
out.push(`esquecimento: ${before.size} registros → ${S.dead.size} (${gone} esquecidos; ficaram ${[...S.dead.values()].filter(d => kin.has(d.id)).length} parentes de vivos e ${[...S.dead.values()].filter(d => V.remembered(d)).length} notáveis)`);
G.Save.apply(JSON.parse(saved)); V.forget();
const keep2 = [...G.S.dead.keys()].sort((a, b) => a - b).join(',');
if (keep1 !== keep2) bad('depois de salvar e carregar, outro conjunto foi esquecido');
const S2 = G.S;
{ const v1 = memV(); if (v1.length) bad('depois do esquecimento: ' + v1.slice(0, 3).join(' | ')); }
// ---- 2. cemeteries: a full town, old and new
const town = [...S2.settlements.values()].sort((a, b) => V.pop(b.id) - V.pop(a.id))[0];
const cems = () => [...S2.buildings.values()].filter(b => b.type === 'cemetery' && b.set === town.id && b.built);
const fill = (b, died) => { b.graves = b.graves || []; while (b.graves.length < 12) { const d = mk({ died, fac: town.fac }); V.bury(b, d); } b.last = died; };
const victim = () => [...S2.villagers.values()].find(v => v.set === town.id && v.age >= 20 && !v.aboard && !v.captive && (G.Fac.get(town.fac) || {}).leader !== v.id);
const killAt = (cause, god) => { const v = victim() || [...S2.villagers.values()].find(v => v.set === town.id && v.age >= 12); if (!v) return null; v.inside = 0; V.kill(v, cause, god); return S2.dead.get(v.id); };
if (!town) bad('nenhuma cidade para testar os cemitérios');
else {
  // a) every cemetery full and its last burial long ago: the oldest is reused, no new one
  if (!cems().length) { const c = V.startProject(town, 'cemetery'); if (c) town.cemetery = c.id; }
  for (const b of cems()) fill(b, S2.day - 45);
  const oldest = cems().sort((a, b) => a.last - b.last)[0]; const oldIds = oldest.graves.slice(); const n0 = cems().length;
  const r = killAt('old');
  if (cems().length !== n0) bad(`cemitérios velhos e cheios: abriu um novo (${n0} → ${cems().length})`);
  if (!r || r.grave !== oldest.id || !oldest.graves.includes(r.id)) bad(`a morte não foi para o cemitério reaproveitado (${r && r.grave} ≠ ${oldest.id})`);
  if (oldest.graves.length !== 1) bad(`o cemitério reaproveitado guardou ${oldest.graves.length} túmulos (esperado 1)`);
  const moved = oldIds.map(id => S2.dead.get(id)).filter(Boolean); if (moved.some(d => d.grave || d.buried !== 'ossuario')) bad('os ossos antigos não foram para o ossuário');
  out.push(`cemitérios velhos e cheios: ${n0} continuam ${cems().length}; o mais antigo recebeu ${r && r.name}; ${moved.length} ossos ao ossuário`);
  // b) full and recent, below what the town calls for: a new one opens
  const cap = 2 + Math.floor(V.pop(town.id) / 60);
  for (const b of cems()) fill(b, S2.day);
  const n1 = cems().length; const b1 = new Set(S2.buildings.keys());
  const r1 = killAt('sick');
  const fresh = [...S2.buildings.values()].find(b => !b1.has(b.id) && b.type === 'cemetery');
  if (n1 < cap) { if (!fresh) bad(`cheios e recentes, ${n1} de ${cap}: não abriu cemitério novo`); else if (!r1 || r1.grave !== fresh.id) bad('a morte não foi para o cemitério novo'); }
  out.push(`cheios e recentes (${n1} de ${cap}): ${fresh ? 'abriu um novo' : 'não abriu'}`);
  // c) full and recent, as many as the town calls for: the oldest is reused anyway
  let guard = 0; while (cems().length < cap && guard++ < 10) { const c = V.startProject(town, 'cemetery'); if (!c) break; fill(c, S2.day); }
  for (const b of cems()) fill(b, S2.day);
  const n2 = cems().length; const r2 = killAt('old', false);
  if (n2 >= cap && cems().length !== n2) bad(`no limite (${n2} de ${cap}): abriu mais um`);
  if (r2 && cems().every(b => !b.graves.includes(r2.id))) bad('no limite: a morte ficou sem túmulo');
  out.push(`no limite (${n2} de ${cap}): ${cems().length} cemitérios depois da morte`);
  // d) a body that reaches a cemetery that filled on the way: the town's next one, never a thirteenth stone
  const full = cems()[0]; fill(full, S2.day); const d4 = mk({ died: S2.day, fac: town.fac }); const got = V.bury(full, d4, 'cem');
  if (full.graves.length > 12) bad(`um corpo entrou num cemitério cheio (${full.graves.length})`);
  if (!got || !got.graves.includes(d4.id)) bad('o corpo que chegou atrasado ficou sem túmulo');
  // e) a cemetery with no town left (an abandoned one): the common pit
  const orphan = cems()[0]; const keepSet = orphan.set; fill(orphan, S2.day); orphan.set = 0; const d5 = mk({ died: S2.day }); const g5 = V.bury(orphan, d5, 'cem'); orphan.set = keepSet;
  if (g5 || d5.buried !== 'vala' || orphan.graves.includes(d5.id)) bad('um cemitério cheio sem cidade aceitou mais um, ou o morto não foi à vala comum');
  // f) the god's lightning: a death by the god's hand is buried like any other
  const r6 = killAt('lightning', true); if (r6 && !r6.grave && !(G.Carnage && G.Carnage.list().some(c => c.vid === r6.id))) bad('o morto do raio ficou sem túmulo nem corpo');
  const v2 = memV(); if (v2.length) bad('depois dos cemitérios: ' + v2.slice(0, 3).join(' | '));
}
// ---- 3. the world goes on: a year with the checker, and a save and a load
QA.run(1);
{ const v3 = memV(); if (v3.length) bad('um ano depois: ' + v3.slice(0, 3).join(' | ')); }
const trip = QA.roundTrip(); if (trip.diff.length) bad('save/load: ' + JSON.stringify(trip.diff.slice(0, 3)).slice(0, 300));
out.push(`um ano depois: ${S2.dead.size} registros, ${[...S2.buildings.values()].filter(b => b.type === 'cemetery').length} cemitérios; ida e volta ${trip.diff.length ? 'com diferenças' : 'igual'}`);
return { fails, out };
