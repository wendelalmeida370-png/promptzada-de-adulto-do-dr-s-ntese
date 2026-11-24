// dentro: quem o mundo põe dentro de cada tipo de prédio num dia inteiro (a tarefa, o lugar da planta, dormindo ou não, a hora)
// node dentro.js [mundo] [dias] > dentro.json   (só lê: o mundo pronto vive na memória do Node)
const M = require('../nodemundo.js');
const G = M.load({ qa: true }); const In = G.Interiors;
const w = process.argv[2] || 'metropole', dias = +(process.argv[3] || 1);
M.pronto(w); const S = G.S;
const out = { w, day0: S.day, t0: S.time, byType: {} };
const steps = Math.round(dias * G.DAY_LEN / 0.1); const every = 20; // (a look every 2 s of the world)
for (let k = 0; k <= steps; k++) {
  if (k % every === 0) {
    const hour = Math.floor(((S.time % 1) * 24));
    const per = new Map();
    for (const v of S.villagers.values()) {
      if (!v.inside || v.inside < 0) continue; const b = S.buildings.get(v.inside); if (!b) continue;
      const r = out.byType[b.type] || (out.byType[b.type] = { looks: 0, people: 0, sleeping: 0, tasks: {}, uses: {}, hours: {}, maxIn: 0, distinct: new Set(), noPlace: 0, bodies: 0 });
      r.people++; if (v.sleeping) r.sleeping++;
      const tk = v.task ? (v.task.type + (v.task.kind ? ':' + v.task.kind : '')) : '-'; r.tasks[tk] = (r.tasks[tk] || 0) + 1;
      let pl = null; try { pl = In.placeOf ? In.placeOf(v) : null; } catch (e) { pl = null; }
      const u = pl ? (pl.use || '?') + (pl.st ? '/' + pl.st : '') : (In.has(b) ? 'SEM-LUGAR' : 'sem-planta'); r.uses[u] = (r.uses[u] || 0) + 1; if (!pl && In.has(b)) r.noPlace++;
      r.hours[hour] = (r.hours[hour] || 0) + 1; r.distinct.add(v.id);
      per.set(b.id, (per.get(b.id) || 0) + 1);
    }
    for (const [id, n] of per) { const b = S.buildings.get(id); const r = out.byType[b.type]; if (n > r.maxIn) { r.maxIn = n; r.maxAt = id; } }
    for (const r of Object.values(out.byType)) r.looks++;
  }
  if (k < steps) G.debug.step(0.1);
}
for (const r of Object.values(out.byType)) r.distinct = r.distinct.size;
out.day1 = S.day; out.err = M.limpo() ? '' : JSON.stringify(M.erros()).slice(0, 400);
console.log(JSON.stringify(out, null, 1));
