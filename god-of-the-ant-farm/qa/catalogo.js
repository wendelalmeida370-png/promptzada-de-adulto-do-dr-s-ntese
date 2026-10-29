// catalogo: o catálogo das famílias de planta, feito pela própria gramática (as provas de cada família em quatro lotes
// de prova) e gravado em js/int-catalogo.js — o jogo lê a tabela em vez de provar as famílias enquanto roda. Nunca se
// edita o arquivo à mão: mudou a gramática (js/int-*.js, js/interiors.js), gere de novo; o qa/plantas.js confere.
//   node qa/catalogo.js                       todas as chaves de base (terra não quente, sem riqueza) de todos os tipos
//   node qa/catalogo.js gera tudo [tipos]     as seis chaves de cada tipo e povo (quente ou não × riqueza 0, 1, 2)
//   node qa/catalogo.js parte <saída.json> <base|tudo> [tipos]   só calcula (para rodar em paralelo) e grava o pedaço
//   node qa/catalogo.js junta <a.json> [b.json…]                 junta pedaços no arquivo do jogo
//   node qa/catalogo.js confere [n]          recalcula n chaves do arquivo e diz se ele está em dia com a gramática
const fs = require('fs'); const path = require('path');
const M = require('./nodemundo.js');
const G = M.load({}); const In = G.Interiors;
const FILE = path.join(__dirname, '..', 'js', 'int-catalogo.js');
const args = process.argv.slice(2);
const keysOf = (mode, types) => {
  const out = [];
  // (a home's keys twice: out of the centre, its yard about it — 'y' —, and in it — 'c': D-082)
  for (const t of types) for (const c of Object.keys(In.TRAD)) for (const hot of mode === 'tudo' ? [0, 1] : [0]) for (const wb of mode === 'tudo' ? [0, 1, 2] : [0]) for (const y of In.GODSZ && In.GODSZ[t] ? ['y', 'c'] : ['']) out.push(y ? [t, c, hot, wb, y] : [t, c, hot, wb]);
  return out;
};
// one key: every family of the type under it (the rules aside: they are read live, in the context of each building)
function compute(t, c, hot, wb, y) {
  const rec = { v: 1, f: '', r: 0, t, u: In.TYPES[t].use, s: 'S', o: 0, c, e: 3, k: 'ae', cl: hot ? 'q' : 't', fl: 0, d: y === 'c' ? 3 : 1, w: wb, pw: 0, h: [], m: 0, fx: [], dr: {} };
  const tab = {}; for (const f of In.TYPES[t].fams) tab[f] = In.probe(rec, f);
  return tab;
}
// the file as the game reads it (the engine decodes it: In.addProbed), read back here as the plain table key → family → 1 | why
function read() {
  if (!fs.existsSync(FILE)) return {};
  const src = fs.readFileSync(FILE, 'utf8'); const m = /addProbed\((\d+), (\{[\s\S]*\})\);/.exec(src); if (!m || +m[1] !== In.VERSION) return {};
  const o = JSON.parse(m[2]); const out = {};
  for (const k in o.keys) { const t = k.split('|')[0]; if (!In.TYPES[t] || o.fams[t] !== In.famPrint(t)) continue; const tab = {}; In.TYPES[t].fams.forEach((f, q) => { const v = o.keys[k][q]; tab[f] = v === 1 ? 1 : o.msgs[v - 2]; }); out[k] = tab; }
  return out;
}
function write(table) {
  const keys = Object.keys(table).sort(); const msgs = []; const idx = new Map(); const fams = {};
  const enc = {}; for (const k of keys) { const t = k.split('|')[0]; fams[t] = In.famPrint(t); enc[k] = In.TYPES[t].fams.map(f => { const v = table[k][f]; if (v === 1) return 1; const w = String(v === undefined ? 'sem prova' : v); if (!idx.has(w)) { idx.set(w, msgs.length); msgs.push(w); } return idx.get(w) + 2; }); }
  const body = keys.map(k => `      ${JSON.stringify(k)}: ${JSON.stringify(enc[k])}`).join(',\n');
  const src = `'use strict';
// O catálogo das famílias de planta: para cada tipo de prédio, povo, terra quente ou não e riqueza (tudo o que a planta
// de um lar lê do lugar), se cada família se arma nas quatro provas ou por que não — um número por família, na ordem da
// lista do tipo: 1 se arma, n é o motivo msgs[n - 2]. GERADO por qa/catalogo.js com a própria gramática — nunca editado
// à mão: mudou a gramática, gere de novo; o qa/plantas.js confere se está em dia.
(function (G) {
  G.Interiors.addProbed(${In.VERSION}, {
    "fams": ${JSON.stringify(fams)},
    "msgs": ${JSON.stringify(msgs)},
    "keys": {
${body}
    }
  });
})(window.G);
`;
  fs.writeFileSync(FILE, src); console.log(`gravado ${path.relative(process.cwd(), FILE)}: ${keys.length} chaves, ${msgs.length} motivos, ${(src.length / 1024).toFixed(0)} KB`);
}
const run = (list) => { const out = {}; let n = 0; for (const [t, c, hot, wb, y] of list) { const k = [t, c, hot, wb].join('|') + (y ? '|' + y : ''); out[k] = compute(t, c, hot, wb, y); n++; const ok = Object.values(out[k]).filter(x => x === 1).length;
  // (and the line of the rule that nobody sleeps standing, D-082 (6): every family that is laid out holds the whole household —
  // in its beds, and the most of the probes on a floor kept for them)
  const H = (G.BDEF[t] || {}).housing; let line = '';
  if (H) { let most = 0, who = ''; for (const f of In.TYPES[t].fams) { if (out[k][f] !== 1) continue; const sh = In.SHORT[k + '/' + f] || 0; if (sh > most) { most = sh; who = f; } } line = most ? ` · abrigam ${H}: no chão guardado até ${most} (${who})` : ` · abrigam ${H}, todos na cama`; }
  console.log(`  ${k}: ${ok} famílias se armam${line} (${n}/${list.length})`); } return out; };
const allTypes = Object.keys(In.TYPES);
const cmd = args[0] || 'gera';
if (cmd === 'gera') {
  const mode = args[1] || 'base'; const types = args[2] ? args[2].split(',') : allTypes;
  const table = read(); Object.assign(table, run(keysOf(mode, types))); write(table);
} else if (cmd === 'parte') {
  const [, out, mode, ty] = args; const types = ty ? ty.split(',') : allTypes;
  fs.writeFileSync(out, JSON.stringify(run(keysOf(mode || 'base', types)))); console.log(`pedaço gravado: ${out}`);
} else if (cmd === 'junta') {
  const table = read(); for (const f of args.slice(1)) Object.assign(table, JSON.parse(fs.readFileSync(f, 'utf8'))); write(table);
} else if (cmd === 'confere') {
  const table = read(); const keys = Object.keys(table).sort(); const n = Math.min(keys.length, +(args[1] || 4));
  let bad = 0;
  for (let q = 0; q < n; q++) {
    const k = keys[Math.floor(q * keys.length / n)]; const [t, c, hot, wb, y] = k.split('|'); if (!In.TYPES[t]) { console.log(`FALHOU | catálogo | ${k}: tipo que a gramática não tem mais`); bad++; continue; }
    const now = compute(t, c, +hot, +wb, y); const diff = Object.keys(Object.assign({}, now, table[k])).filter(f => String(now[f]) !== String(table[k][f]));
    if (diff.length) { bad++; console.log(`FALHOU | catálogo | ${k}: ${diff.length} famílias mudaram (${diff.slice(0, 4).join(', ')}): gere de novo com node qa/catalogo.js`); }
    else console.log(`PASSOU | catálogo | ${k} em dia`);
  }
  const missing = keysOf('base', allTypes).map(x => x.join('|')).filter(k => !table[k]);
  if (missing.length) { bad++; console.log(`FALHOU | catálogo | faltam ${missing.length} chaves de base (${missing.slice(0, 4).join(', ')}): node qa/catalogo.js`); }
  console.log(bad ? `FALHOU: ${bad}` : 'PASSOU'); process.exit(bad ? 1 : 0);
} else { console.log('comando? gera | parte | junta | confere'); process.exit(2); }
