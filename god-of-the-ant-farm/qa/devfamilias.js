// devfamilias: as famílias que o modo desenvolvedor faz (F2 → «+20 famílias», e o preparo da Guerra Mundial) — L-219.
//   node qa/devfamilias.js
// O «+N famílias» sorteava a idade de cada filho sem olhar a dos pais: uma mãe de 18 anos com um filho de 14, e o
// verificador acusava S1 («mãe nasceu só 4 anos antes»); o macaco da regressão achou um. Aqui: duzentas famílias num mundo
// novo, e cada filho nasce pelo menos 11 anos depois da mãe e do pai — a regra de família do verificador.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, dev: true });
M.novo({ seed: 7, type: 'continente', size: 96, tribes: 3 });
const n0 = G.S.nextId;
for (let k = 0; k < 10; k++) G.Dev.act.fam(20);
let kids = 0, gap = Infinity;
for (const v of G.S.villagers.values()) {
  if (v.id < n0) continue;
  for (const k of ['mother', 'father']) { const q = v[k] && G.S.villagers.get(v[k]); if (q) { kids++; gap = Math.min(gap, v.born - q.born); } }
}
const bad = QA.check().filter(q => q.sys === 'fam' && q.sev <= 2).map(q => `S${q.sev} ${q.msg}`);
const e = M.erros(); const mods = Object.keys(e.mod);
const ok = kids > 0 && !bad.length && !mods.length && !e.console.length;
console.log(`${ok ? 'PASSOU' : 'FALHOU'} | devfamilias as famílias do modo desenvolvedor: cada filho ao menos 11 anos depois da mãe e do pai | ${kids} laços de filho; a menor distância: ${gap.toFixed(1)} anos; o verificador: ${bad.length ? bad.length + ' acusações, ex.: ' + bad[0] : 'limpo'}; módulos ${mods.join(', ') || 'nenhum'}`);
process.exit(ok ? 0 : 1);
