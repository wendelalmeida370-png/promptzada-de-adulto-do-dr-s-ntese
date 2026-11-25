// vento-load (T-2135): o vento dos bichos logo depois de abrir um mundo é o do mundo aberto (não o do anterior)

const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const want = () => { const w = G.S.weather || {}; return Math.max(0.35, Math.min(1.4, (w.windS || 0.3) * 2)); };
const out = [];
for (const w of ['cidade', 'metropole', 'cidade']) { M.pronto(w); out.push([w, +want().toFixed(3), +G.Meio.wind().s.toFixed(3)]); }
const bad = out.filter(r => Math.abs(r[1] - r[2]) > 1e-6);
console.log(JSON.stringify(out)); console.log(bad.length ? 'FALHOU: o vento dos bichos é o de outro mundo logo ao abrir' : 'PASSOU: o vento dos bichos é o do mundo aberto, logo ao abrir');
if (bad.length) process.exitCode = 1;
