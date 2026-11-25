// catalogo: as peças do catálogo da planta (In.ITEMS), quem as usa nas plantas de verdade, e quais têm modelo do Blender
const M = require('../nodemundo.js');
const fs = require('fs');
const G = M.load({}); const In = G.Interiors;
// (the furniture's library is an index and its packs — js/movelmesh.js, js/movelmesh-<família>.js, D-1020 —: every file of it read, T-2163)
const JSD = require('path').join(__dirname, '..', '..', 'js');
const mesh = fs.readdirSync(JSD).filter(f => /^movelmesh(-[\w-]+)?\.js$/.test(f)).sort().map(f => fs.readFileSync(require('path').join(JSD, f), 'utf8')).join('\n');
const models = new Set([...mesh.matchAll(/M\["movel-([a-z-]+?)-(romano|classico|grego|egipcio|nordico|asteca)/g)].map(m => m[1]));
const P = require('./plantas.json');
const use = {}; for (const p of P.real.concat(P.sample)) for (const k in p.items) { (use[k] = use[k] || new Set()).add(p.t); }
const rows = [];
for (const k of Object.keys(In.ITEMS).sort()) { const D = In.ITEMS[k]; const fl = ['low','wall','solid','free','store','fire','job','mount','niche','tall','places','lie','seat','chao','min','parts','hot'].filter(f => D[f]).map(f => f + (typeof D[f] === 'object' ? '' : (D[f] === 1 || D[f] === true ? '' : '=' + D[f])));
  rows.push(`${k.padEnd(18)} ${String(D.name || '').padEnd(28)} ${[D.w, D.d, D.h].join('×').padEnd(16)} ${models.has(k) ? 'MODELO' : 'caixa '} ${fl.join(',').padEnd(40)} ${[...(use[k] || [])].join(',')}`); }
console.log(rows.join('\n'));
console.log('total', Object.keys(In.ITEMS).length, 'com modelo', [...models].filter(k => In.ITEMS[k]).length, 'modelos que não são peça', [...models].filter(k => !In.ITEMS[k]).join(','));
