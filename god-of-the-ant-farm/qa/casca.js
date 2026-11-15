// casca: a casca de um prédio vista de longe (Interiors.shellOf) é sempre a da planta inteira (Interiors.plan) — a casca,
// o telhado, o anexo e o pátio, os pisos (lv, y, h, kind, slab), os furos das paredes da casca, a entrada —, em todos os
// prédios dos mundos prontos; e quanto custa a casca sozinha (o alvo: menos de ~0,2 ms por prédio), e a planta inteira
// (que se pede aos poucos: want/pump). A proximidade escolhe a resolução, nunca os fatos.
//   node qa/casca.js [mundo,mundo...]      (sem nada: todos os de worlds/lista.js)
const M = require('./nodemundo.js');
const G = M.load({}); const In = G.Interiors;
const fs = require('fs'); const path = require('path');
const list = process.argv[2] ? process.argv[2].split(',') : (() => { const src = fs.readFileSync(path.join(__dirname, '..', 'worlds', 'lista.js'), 'utf8'); return [...src.matchAll(/^ "([a-z0-9]+)": \{/gm)].map(m => m[1]); })();
const clock = () => Number(process.hrtime.bigint()) / 1e6;
const strip = s => { const o = Object.assign({}, s); delete o.key; return JSON.stringify(o); };
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | casca ${name} | ${info}`); if (!c) fails.push(name); };
const t00 = clock(); let all = 0;
for (const key of list) {
  M.pronto(key); In.uncache();
  let n = 0, bad = 0, inval = 0, short = 0, fell = 0; const ts = [], tp = []; const ex = [];
  for (const b of G.S.buildings.values()) {
    if (!b.ip || !In.TYPES[b.ip.t]) continue;
    let a = clock(); const s1 = In.shellOf(b); ts.push(clock() - a);
    a = clock(); const p = In.plan(b); tp.push(clock() - a);
    n++; if (!p.ok) inval++; if (p.short) short++; if (p.fell) fell++;
    const s2 = In.shellOfPlan(p);
    if (!s1 || strip(s1) !== strip(s2)) { bad++; if (ex.length < 3) ex.push(`#${b.id} ${b.type}/${b.ip.f}`); }
  }
  // (the shells again, the code warm — as when the 3D asks for every building of the view once the first ones were drawn —,
  // three times each: the least of the three is the shell's cost; a pause of the collector or of a busy machine is not — in a
  // world of 56 buildings, two such pauses were a third of the mean)
  const tw = []; for (const b of G.S.buildings.values()) { if (!b.ip || !In.TYPES[b.ip.t]) continue; let best = Infinity; for (let r = 0; r < 3; r++) { In.uncache(); const a = clock(); In.shellOf(b); best = Math.min(best, clock() - a); } tw.push(best); }
  all += n; ts.sort((x, y) => x - y); tp.sort((x, y) => x - y); tw.sort((x, y) => x - y);
  const avg = a => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length); const pc = (a, q) => a[Math.min(a.length - 1, Math.floor(a.length * q))] || 0;
  ok(`${key} igual`, bad === 0, `${n} prédios com planta: a casca de longe difere da planta em ${bad}${ex.length ? ' (' + ex.join(', ') + ')' : ''}`);
  ok(`${key} plantas`, inval === 0, `${inval} plantas inválidas; ${short} com gente dormindo no chão; ${fell} de outra família que a do registro`);
  // (the gate on the mean of the 99% fastest: one pause of the collector, or of a busy machine, is not the shell's)
  const trim = tw.slice(0, Math.max(1, Math.ceil(tw.length * 0.99)));
  ok(`${key} custo`, avg(trim) < 0.2, `a casca ${avg(trim).toFixed(3)} ms em média sem o 1% mais lento (${avg(tw).toFixed(3)} ms com ele; 99% abaixo de ${pc(tw, 0.99).toFixed(2)} ms, a pior ${pc(tw, 1).toFixed(1)} ms; na primeira passada, o código frio: ${avg(ts).toFixed(3)} ms, a pior ${pc(ts, 1).toFixed(1)} ms); a planta inteira ${avg(tp).toFixed(1)} ms em média (99% abaixo de ${pc(tp, 0.99).toFixed(0)} ms, a pior ${pc(tp, 1).toFixed(0)} ms)`);
}
console.log(`${all} prédios em ${list.length} mundos, ${((clock() - t00) / 1000).toFixed(0)} s`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
