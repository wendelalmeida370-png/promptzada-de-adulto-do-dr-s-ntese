// junta-inv: as invariantes dos sistemas em construção (cada uma no arquivo do seu dono) copiadas para dentro do qa/qa.js,
// entre as marcas — assim toda prova que carrega só o qa.js (a soak, a regressão, o navegador) confere também as delas.
//   node qa/junta-inv.js          escreve o bloco      ·   node qa/junta-inv.js confere   só diz se o bloco está igual
// (o guard.js cobra, regra 21: o bloco igual aos arquivos; carregar o arquivo de novo depois do qa.js só repete as mesmas
// regras, e o verificador junta as mensagens iguais)
const fs = require('fs'), path = require('path');
const QA = path.join(__dirname, 'qa.js');
const FILES = ['qa/atividades-inv.js', 'qa/interiores-inv.js', 'qa/visual/corpo-qa.js', 'qa/lar-inv.js', 'qa/forma-inv.js', 'qa/oficio-inv.js', 'qa/escala-inv.js', 'qa/monumental-inv.js', 'qa/poder-inv.js', 'qa/saber-inv.js', 'qa/bairro-inv.js', 'qa/som-inv.js', 'qa/sabe-inv.js', 'qa/atmos-inv.js', 'qa/quintal-inv.js', 'qa/degraus-inv.js', 'qa/termas-grandes-inv.js', 'qa/morar-palacio-inv.js', 'qa/freguesia-inv.js', 'qa/canteiro-inv.js', 'qa/aterro-inv.js', 'qa/casa-cheia-inv.js', 'qa/casa-cheia2-inv.js', 'qa/terra-guardada-inv.js', 'qa/oficio-fica-inv.js', 'qa/praca-inv.js', 'qa/dia-inv.js', 'qa/medo-inv.js', 'qa/meio-inv.js', 'qa/mente-inv.js', 'qa/corpo-fera-inv.js', /* 20a: */ 'qa/anim-inv.js', /* 20b: */ 'qa/movimento-inv.js', /* 20c: */ 'qa/inventario-inv.js', /* 20d: */ 'qa/itens-arte-inv.js', /* 20h: */ 'qa/origem-inv.js', 'qa/combate-inv.js', /* 20e: */ 'qa/interacao-inv.js', /* 20g: */ 'qa/trabalho-inv.js', /* 21a: */ 'qa/mata-inv.js', /* 21d: */ 'qa/ceu-inv.js', /* 21c: */ 'qa/agua-inv.js'];
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
