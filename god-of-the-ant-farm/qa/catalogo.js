// catalogo: o catálogo das famílias de planta, feito pela própria gramática (as provas de cada família em quatro lotes
// de prova) e gravado em js/int-catalogo.js — o jogo lê a tabela em vez de provar as famílias enquanto roda. Nunca se
// edita o arquivo à mão: mudou a gramática de um tipo, suba a versão dele (In.VERSION_T, js/interiors.js) e gere de novo só
// as linhas dele; o qa/plantas.js e o confere conferem. Cada tipo tem a sua versão no arquivo (vers): as linhas de um tipo
// cuja versão subiu o jogo não lê (prova as famílias dele ao vivo, devagar) até serem feitas de novo — F13, D-990.
//   node qa/catalogo.js                       todas as chaves de base (terra não quente, sem riqueza) de todos os tipos
//   node qa/catalogo.js gera forja[,taverna]  todas as chaves desses tipos (o mesmo que gera tudo forja): o que se faz quando
//                                            a versão de um tipo sobe — as linhas dos outros tipos ficam como estão
//   node qa/catalogo.js gera tudo [tipos]     as seis chaves de cada tipo e povo (quente ou não × riqueza 0, 1, 2)
//   node qa/catalogo.js parte <saída.json> <base|tudo> [tipos]   só calcula (para rodar em paralelo) e grava o pedaço
//                                            (CIVS=nordico,grego: só as chaves desses povos — as casas, de um tipo só, em paralelo)
//   node qa/catalogo.js junta <a.json> [b.json…]                 junta pedaços no arquivo do jogo
//   node qa/catalogo.js confere [n]          recalcula n chaves do arquivo e diz se ele está em dia com a gramática (e se a
//                                            versão de cada tipo no arquivo é a de agora)
//   node qa/catalogo.js confere forja[,…]    recalcula todas as chaves desses tipos
//   (CATALOGO=arquivo: outro arquivo no lugar do js/int-catalogo.js — as provas, que não escrevem no do jogo)
// (as a module — require('./catalogo.js') —, with the game already loaded by the proof that asks: { keysOf, keyOf, partsOf,
// compute, read, raw, write, FILE }, and no command run)
const fs = require('fs'); const path = require('path');
const M = require('./nodemundo.js');
const G = global.G && global.G.Interiors ? global.G : M.load({}); const In = G.Interiors;
const FILE = process.env.CATALOGO ? path.resolve(process.env.CATALOGO) : path.join(__dirname, '..', 'js', 'int-catalogo.js');
const args = process.argv.slice(2);
// (and a key of each bigger step of the type's ladder this people can raise — G.Escala.can: its form of that size, or a lot
// the type's recipes are laid out in —, the game's own with the size, nKey: the game reads the table for them too, and never
// probes the families of a Colosseum while the world runs — L-510, half a second the first time)
const sizesOf = (t, c) => { const n0 = (G.BDEF[t] || {}).w || 1; return G.Escala ? [0, ...G.Escala.steps(t).map(st => st.n).filter((n, q, a) => n !== n0 && a.indexOf(n) === q && G.Escala.can(t, c, n))] : [0]; };
const keyOf = (t, c, hot, wb, y, n) => [t, c, hot, wb].join('|') + (y ? '|' + y : '') + (n ? '|n' + n : '');
const keysOf = (mode, types) => {
  const out = [];
  // (a home's keys twice: out of the centre, its yard about it — 'y' —, and in it — 'c': D-082)
  const civs = process.env.CIVS ? process.env.CIVS.split(',') : null;
  for (const t of types) for (const c of Object.keys(In.TRAD).filter(q => !civs || civs.includes(q))) for (const n of sizesOf(t, c)) for (const hot of mode === 'tudo' ? [0, 1] : [0]) for (const wb of mode === 'tudo' ? [0, 1, 2] : [0]) for (const y of In.GODSZ && In.GODSZ[t] ? ['y', 'c'] : ['']) out.push([t, c, hot, wb, y, n]);
  return out;
};
// (a key back to its parts: the size its last, when it has one)
const partsOf = k => { const q = k.split('|'); const n = /^n\d+$/.test(q[q.length - 1]) ? +q.pop().slice(1) : 0; return [q[0], q[1], +q[2], +q[3], q[4] || '', n]; };
// one key: every family of the type under it (the rules aside: they are read live, in the context of each building)
function compute(t, c, hot, wb, y, n) {
  const rec = { v: 1, f: '', r: 0, t, u: In.TYPES[t].use, s: 'S', o: 0, c, e: 3, k: 'ae', cl: hot ? 'q' : 't', fl: 0, d: y === 'c' ? 3 : 1, w: wb, pw: 0, h: [], m: 0, fx: [], dr: {} };
  if (n) rec.n = n; // (a bigger step: the probes on lots of its size)
  const tab = {}; for (const f of In.TYPES[t].fams) tab[f] = In.probe(rec, f);
  return tab;
}
// the file as it is: the engine's grammar its lines were made by, each type's own (vers: none in a file of before the types had
// their own — every type at 0) and its encoded lines
function raw(file) {
  file = file || FILE; if (!fs.existsSync(file)) return null;
  const src = fs.readFileSync(file, 'utf8'); const m = /addProbed\((\d+), (\{[\s\S]*\})\);/.exec(src); if (!m) return null;
  const o = JSON.parse(m[2]); return { ver: +m[1], vers: o.vers || {}, o };
}
// (whether a type's lines in the file are of its grammar now: the engine's and its own)
const fresh = (R, t) => !!R && R.ver === In.VERSION && ((R.vers[t] | 0) === (In.VERSION_T[t] | 0));
// the file as the game reads it (the engine decodes it: In.addProbed), read back here as the plain table key → family → 1 | why:
// only the lines the game would read — a type whose grammar went up since its lines were made, none of them
function read(file) {
  const R = raw(file); if (!R) return {}; const o = R.o; const out = {};
  for (const k in o.keys) { const t = k.split('|')[0]; if (!In.TYPES[t] || o.fams[t] !== In.famPrint(t) || !fresh(R, t)) continue; const tab = {}; In.TYPES[t].fams.forEach((f, q) => { const v = o.keys[k][q]; tab[f] = v === 1 ? 1 : o.msgs[v - 2]; }); out[k] = tab; }
  return out;
}
function write(table, file) {
  file = file || FILE;
  const keys = Object.keys(table).sort(); const msgs = []; const idx = new Map(); const fams = {}; const vers = {};
  const enc = {}; for (const k of keys) { const t = k.split('|')[0]; fams[t] = In.famPrint(t); vers[t] = In.VERSION_T[t] | 0; enc[k] = In.TYPES[t].fams.map(f => { const v = table[k][f]; if (v === 1) return 1; const w = String(v === undefined ? 'sem prova' : v); if (!idx.has(w)) { idx.set(w, msgs.length); msgs.push(w); } return idx.get(w) + 2; }); }
  const body = keys.map(k => `      ${JSON.stringify(k)}: ${JSON.stringify(enc[k])}`).join(',\n');
  const src = `'use strict';
// O catálogo das famílias de planta: para cada tipo de prédio, povo, terra quente ou não e riqueza (tudo o que a planta
// de um lar lê do lugar), se cada família se arma nas quatro provas ou por que não — um número por família, na ordem da
// lista do tipo: 1 se arma, n é o motivo msgs[n - 2]; e a versão da gramática de cada tipo que fez as suas linhas (vers:
// a do tipo em In.VERSION_T). GERADO por qa/catalogo.js com a própria gramática — nunca editado à mão: mudou a gramática de
// um tipo, suba a versão dele e gere de novo só o dele (node qa/catalogo.js gera TIPO); o qa/plantas.js confere se está em dia.
(function (G) {
  G.Interiors.addProbed(${In.VERSION}, {
    "vers": ${JSON.stringify(vers)},
    "fams": ${JSON.stringify(fams)},
    "msgs": ${JSON.stringify(msgs)},
    "keys": {
${body}
    }
  });
})(window.G);
`;
  fs.writeFileSync(file, src); console.log(`gravado ${path.relative(process.cwd(), file)}: ${keys.length} chaves, ${msgs.length} motivos, ${(src.length / 1024).toFixed(0)} KB`);
}
const run = (list) => { const out = {}; let n = 0; for (const [t, c, hot, wb, y, sz] of list) { const k = keyOf(t, c, hot, wb, y, sz); out[k] = compute(t, c, hot, wb, y, sz); n++; const ok = Object.values(out[k]).filter(x => x === 1).length;
  // (and the line of the rule that nobody sleeps standing, D-082 (6): every family that is laid out holds the whole household —
  // in its beds, and the most of the probes on a floor kept for them)
  const H = (G.BDEF[t] || {}).housing; let line = '';
  if (H) { let most = 0, who = ''; for (const f of In.TYPES[t].fams) { if (out[k][f] !== 1) continue; const sh = In.SHORT[k + '/' + f] || 0; if (sh > most) { most = sh; who = f; } } line = most ? ` · abrigam ${H}: no chão guardado até ${most} (${who})` : ` · abrigam ${H}, todos na cama`; }
  if (!process.env.QUIET) console.log(`  ${k}: ${ok} famílias se armam${line} (${n}/${list.length})`); } return out; };
const allTypes = Object.keys(In.TYPES);
module.exports = { keysOf, keyOf, partsOf, compute, read, raw, write, run, fresh, FILE };
if (require.main === module) {
  const cmd = args[0] || 'gera';
  // (a list of types where the mode would be: «gera forja» is «gera tudo forja» — the type whose version went up, all its keys)
  const typesArg = a => !!a && a !== 'base' && a !== 'tudo' && a.split(',').every(t => In.TYPES[t]);
  if (cmd === 'gera') {
    const [mode, types] = typesArg(args[1]) ? ['tudo', args[1].split(',')] : [args[1] || 'base', args[2] ? args[2].split(',') : allTypes];
    const bad = types.filter(t => !In.TYPES[t]); if (bad.length) { console.log(`tipo que a gramática não tem: ${bad.join(', ')}`); process.exit(2); }
    const table = read(); Object.assign(table, run(keysOf(mode, types))); write(table);
  } else if (cmd === 'parte') {
    const [, out, mode, ty] = args; const types = ty ? ty.split(',') : allTypes;
    fs.writeFileSync(out, JSON.stringify(run(keysOf(mode || 'base', types)))); console.log(`pedaço gravado: ${out}`);
  } else if (cmd === 'junta') {
    const table = read(); for (const f of args.slice(1)) Object.assign(table, JSON.parse(fs.readFileSync(f, 'utf8'))); write(table);
  } else if (cmd === 'confere') {
    const R = raw(); const table = read(); let bad = 0;
    // (each type's lines of its grammar now — the engine's and its own —, or the game probes its families live: the version went
    // up and its lines were not made again)
    const inFile = R ? Object.keys(R.o.fams || {}) : [];
    for (const t of inFile.filter(t => In.TYPES[t] && !fresh(R, t))) { bad++; console.log(`FALHOU | catálogo | as linhas de ${t} são da gramática ${R.ver}${R.vers[t] ? '.' + R.vers[t] : ''}, a de agora é ${In.versionOf(t)}: node qa/catalogo.js gera ${t}`); }
    let keys;
    if (typesArg(args[1])) { const ty = args[1].split(','); keys = keysOf('tudo', ty).map(x => keyOf(...x)); const miss = keys.filter(k => !table[k]); if (miss.length) { bad++; console.log(`FALHOU | catálogo | faltam ${miss.length} chaves de ${ty.join(', ')} (${miss.slice(0, 4).join(', ')}): node qa/catalogo.js gera ${ty.join(',')}`); } keys = keys.filter(k => table[k]); }
    else { const all = Object.keys(table).sort(); const n = Math.min(all.length, +(args[1] || 4)); keys = []; for (let q = 0; q < n; q++) keys.push(all[Math.floor(q * all.length / n)]); }
    for (const k of keys) {
      const [t, c, hot, wb, y, sz] = partsOf(k); if (!In.TYPES[t]) { console.log(`FALHOU | catálogo | ${k}: tipo que a gramática não tem mais`); bad++; continue; }
      const now = compute(t, c, hot, wb, y, sz); const diff = Object.keys(Object.assign({}, now, table[k])).filter(f => String(now[f]) !== String(table[k][f]));
      if (diff.length) { bad++; console.log(`FALHOU | catálogo | ${k}: ${diff.length} famílias mudaram (${diff.slice(0, 4).join(', ')}): gere de novo com node qa/catalogo.js gera ${t}`); }
      else if (!process.env.QUIET) console.log(`PASSOU | catálogo | ${k} em dia`);
    }
    const missing = keysOf('base', allTypes).map(x => keyOf(...x)).filter(k => !table[k]);
    if (missing.length) { bad++; console.log(`FALHOU | catálogo | faltam ${missing.length} chaves de base (${missing.slice(0, 4).join(', ')}): node qa/catalogo.js`); }
    console.log(bad ? `FALHOU: ${bad}` : `PASSOU (${keys.length} chaves recalculadas; as versões: ${allTypes.filter(t => In.VERSION_T[t] | 0).map(t => t + ' ' + In.versionOf(t)).join(', ') || 'todos os tipos na ' + In.VERSION})`); process.exit(bad ? 1 : 0);
  } else { console.log('comando? gera | parte | junta | confere'); process.exit(2); }
}
