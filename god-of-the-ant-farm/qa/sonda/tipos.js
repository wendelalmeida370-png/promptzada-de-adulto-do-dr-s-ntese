// tipos: o inventário dos tipos de prédio — G.BDEF, a escada (G.Escala), a planta (In.TYPES), a forma (G.Forma)
// node tipos.js > tipos.json   (só lê o jogo; nada escreve no repositório)
const M = require('../nodemundo.js');
const G = M.load({ qa: true }); const In = G.Interiors; const Fo = G.Forma; const Es = G.Escala;
const CIVS = Object.keys(In.TRAD);
const out = { civs: CIVS, formTypes: Fo.types(), types: {} };
for (const t of Object.keys(G.BDEF)) {
  const d = G.BDEF[t]; const T = In.TYPES[t];
  const o = {
    name: d.name, desc: (G.BDESC || {})[t] || '', w: d.w, h: d.h, housing: d.housing || 0, jobs: d.jobs || 0, role: d.role || '',
    blocks: !!d.blocks, storage: d.storage || 0, dropoff: !!d.dropoff, aposentos: d.aposentos || 0, cost: d.cost, hp: d.hp,
    steps: Es.steps(t).map(s => ({ id: s.id, nome: s.nome, n: s.n, legado: !!s.legado, familia: !!s.familia, req: s.req })),
    plan: T ? { use: T.use, fams: (T.fams || []).length, famList: (T.fams || []).slice(0, 60), open: T.open || 0, lockNight: T.lockNight || 0, sizes: T.sizes || null, formFam: T.formFam || null, stepFam: T.stepFam || null, storeAll: T.storeAll || 0 } : null,
    form: {},
  };
  for (const c of CIVS) { if (Fo.has(t, c)) o.form[c] = Fo.sizes(t, c); }
  out.types[t] = o;
}
console.log(JSON.stringify(out, null, 1));
const e = M.erros(); if (!M.limpo()) console.error('erros', JSON.stringify(e).slice(0, 400));
