// vida-dia: how much of a person's day the 3D shows as only walking, standing or asleep (22c, the measure of the study of the
// animations, §2.1, as a number of progress: SOCIEDADE.md §4). A ready world lived a day (G.DAY_LEN seconds), every person asked
// every 5 s what the drawing would pose them as (G.Anim3D.stateOf — the act, the errand, the move — with the porte the reader
// gives them), the share of the person-samples in «walk + idle + sleep», the share with a porte of their own (old, tired, cold…)
// and the errands that still fall to the plain stance. Only reads (a copy of the world in Node; nothing is saved).
//   node qa/vida-dia.js [metropole|mega|cidade] [segundos]
//   → VIDA-DIA=nn.n%: walking, standing or asleep and nothing more on them (the study's 75.2% in the metropole before 22c, when
//     nothing more was ever drawn on them), the base states alone, and the table
const path = require('path');
const T = require(path.join(__dirname, 'visual', 'tres-node.js'));
const { G, M } = T.load();
const key = process.argv[2] || 'metropole', secs = +(process.argv[3] || (G.DAY_LEN || 200));
M.pronto(key);
const A = G.Anim3D, V3 = G.Vida3D || {}; // (a game from before 22c: no reader — the same measure, nothing more on anyone)
const by = {}, states = {}; let n = 0, porte = 0, plain = 0;
for (let t = 0; t < secs; t += 5) {
  M.viver(5); const S = G.S;
  for (const v of S.villagers.values()) {
    if (v.aboard || v.ug) continue; n++;
    // (the speed as the study took it: moving, a walk's; standing, none)
    const sp = v.moving ? 1.6 : 0; const st = A.stateOf(v, sp);
    states[st] = (states[st] || 0) + 1;
    // (plain: walking, standing or asleep and nothing more on them — no act over the stride, no porte of their own, no little
    // thing of the idle under way)
    const p = V3.porteOf ? V3.porteOf(v) : null; if (p && p.any) porte++;
    const bare = (st === 'walk' || st === 'idle' || st === 'sleep') && !(V3.overOf && V3.overOf(v, st)) && !(p && p.any) && !(st === 'idle' && V3.idleAt && V3.idleAt(v, S.clock));
    if (bare) plain++;
    const k = v.task ? v.task.type : '(sem)'; const e = by[k] || (by[k] = { n: 0, plain: 0 }); e.n++; if (bare && st !== 'sleep') e.plain++;
  }
}
const pct = x => (100 * x / Math.max(1, n)).toFixed(1) + '%';
const base = (states.walk || 0) + (states.idle || 0) + (states.sleep || 0);
console.log(`${key}: ${secs} s de mundo, ${n} pessoa-amostras`);
console.log('estados do 3D: ' + Object.entries(states).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([k, x]) => k + ' ' + pct(x)).join(' · '));
console.log(`com um porte próprio (velho, cansado, frio, calor, luto…): ${pct(porte)}`);
console.log('as tarefas que mais caem em «andar» ou «parado»: ' + Object.entries(by).filter(([, e]) => e.n >= n * 0.004).sort((a, b) => b[1].plain - a[1].plain).slice(0, 12).map(([k, e]) => `${k} ${Math.round(100 * e.plain / e.n)}% de ${pct(e.n)}`).join(' · '));
console.log(`o estado de baixo andar + parado + dormindo: ${pct(base)}`);
console.log(`VIDA-DIA=${pct(plain)} (andando, parado ou dormindo e nada mais: sem ato por cima, sem porte, sem micro-ação)`);
