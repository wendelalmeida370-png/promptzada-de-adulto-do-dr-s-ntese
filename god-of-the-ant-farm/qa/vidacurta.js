// vidacurta: the short life before each commit (CLAUDE.md, step 3), in node while the browser is busy — the same world
// as the browser's `node soak.js 103 continente 128 4 normal 5 1 1`: every year the checker and a save → load round
// trip (QA.roundTrip); any module error or console error or warning is a failure.
//   node qa/vidacurta.js [semente] [tipo] [tamanho] [povos] [anos]
const M = require('./nodemundo.js');
const [seed, type, size, tribes, years] = [+(process.argv[2] || 103), process.argv[3] || 'continente', +(process.argv[4] || 128), +(process.argv[5] || 4), +(process.argv[6] || 5)];
const extra = ['qa/atividades-inv.js'].filter(f => require('fs').existsSync(require('path').join(__dirname, '..', f)));
const G = M.load({ qa: true, extra });
const t0 = Date.now ? process.hrtime.bigint() : 0n; const ms = () => Number((process.hrtime.bigint() - t0) / 1000000n);
M.novo({ seed, type, size, tribes, temper: 'normal' });
let fails = 0;
for (let y = 1; y <= years; y++) {
  QA.run(1);
  const bad = QA.check().filter(q => q.sev <= 2);
  const rt = QA.roundTrip();
  const e = M.erros();
  const okY = !bad.length && !rt.diff.length && M.limpo();
  if (!okY) fails++;
  console.log(`${okY ? 'PASSOU' : 'FALHOU'} | vida ${seed} ano ${y} | ${G.S.villagers.size} pessoas, dia ${G.S.day}; verificador ${bad.length ? bad.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'limpo'}; save ${rt.bytes} caracteres${rt.diff.length ? ', diferenças: ' + rt.diff.slice(0, 3).join(' · ') : ', sem diferença'}${M.limpo() ? '' : '; erros: ' + JSON.stringify(e.mod) + ' ' + e.console.slice(0, 3).join(' | ')} (${ms()} ms)`);
}
console.log(fails ? `VIDA CURTA: FALHOU (${fails} de ${years} anos)` : `VIDA CURTA: ok (${ms()} ms)`);
process.exit(fails ? 1 : 0);
