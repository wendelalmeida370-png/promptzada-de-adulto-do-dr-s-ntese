// junta-inv: as invariantes dos sistemas em construção (cada uma no arquivo do seu dono) copiadas para dentro do qa/qa.js,
// entre as marcas — assim toda prova que carrega só o qa.js (a soak, a regressão, o navegador) confere também as delas.
//   node qa/junta-inv.js          escreve o bloco      ·   node qa/junta-inv.js confere   só diz se o bloco está igual
// (o guard.js cobra, regra 21: o bloco igual aos arquivos; carregar o arquivo de novo depois do qa.js só repete as mesmas
// regras, e o verificador junta as mensagens iguais)
const fs = require('fs'), path = require('path');
const QA = path.join(__dirname, 'qa.js');
const FILES = ['qa/atividades-inv.js', 'qa/interiores-inv.js', 'qa/visual/corpo-qa.js', 'qa/lar-inv.js', 'qa/forma-inv.js'];
const A = '  // ==== as invariantes dos sistemas novos (geradas por qa/junta-inv.js; não edite aqui: edite o arquivo e rode o junta) ====\n';
const Z = '  // ==== fim das invariantes dos sistemas novos ====\n';
const block = () => A + FILES.map(f => `  // ---- ${f} ----\n` + fs.readFileSync(path.join(__dirname, '..', f), 'utf8').replace(/\s+$/, '') + '\n').join('') + Z;
const M = module.exports = { FILES, block, current() { const s = fs.readFileSync(QA, 'utf8'); const i = s.indexOf(A), j = s.indexOf(Z); return i < 0 || j < 0 ? null : s.slice(i, j + Z.length); } };
if (require.main === module) {
  const cur = M.current(), want = block();
  if (process.argv[2] === 'confere') { console.log(cur === want ? 'JUNTA: igual' : 'JUNTA: diferente (rode node qa/junta-inv.js)'); process.exit(cur === want ? 0 : 1); }
  let s = fs.readFileSync(QA, 'utf8');
  if (cur) s = s.replace(cur, want);
  else { const at = '  QA.canonMore = [];\n'; if (!s.includes(at)) throw new Error('não achei o lugar do bloco no qa.js'); s = s.replace(at, at + want); }
  fs.writeFileSync(QA, s); console.log('JUNTA: escrito (' + FILES.length + ' arquivos)');
}
