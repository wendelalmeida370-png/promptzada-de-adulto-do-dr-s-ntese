// fauna-contas: node qa/fauna-contas.js [semente] [anos] [tipo] — as contas da fauna de um mundo vivido pelo salto (T-1333):
// por espécie selvagem com habitat, o teto, quantos estão vivos no fim, quantos anos passou extinta (contada a cada ano), os nascimentos (cria:
// nascida de uma mãe; outro: a imigração e o que o mundo põe) e as mortes por causa (bicho: comida ou morta por outro bicho; gente;
// hunger, old, thirst, fire, stranded…), e a cada 20 anos a linha do f2 do fauna.js (quantas vivas). Não julga nada: é a régua de
// quem acerta o equilíbrio — compare duas versões na mesma semente, e várias sementes, nunca uma só (o mundo é caótico: um passo
// diferente muda tudo depois).   OFF=thirst,options node qa/fauna-contas.js 103 60   desliga partes do meio (G.Meio.off)
//   POR=1 também diz, das mortes por gente, a tarefa de quem matou, o estado da fera (→ele: vinha atrás dele) e onde (na cidade, na
//   beira — o anel e quatro casas —, perto, no mato)
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const seed = +(process.argv[2] || 103), years = +(process.argv[3] || 60), type = process.argv[4] || 'continente';
if (process.env.OFF && G.Meio) for (const k of process.env.OFF.split(',')) G.Meio.off[k] = true;
M.novo({ seed, type, size: 128, tribes: 4 });
const A = G.Animals; const wild = k => A.DEF[k] && !A.DEF[k].dom;
const D = {}, B = {}, Z = {}, P = {}, cause = {};
const note = (o, k, w) => { const t = o[k] = o[k] || {}; t[w] = (t[w] || 0) + 1; };
const ringOf = a => { let best = 1e9; for (const s of G.S.settlements.values()) best = Math.min(best, G.dist(a.x, a.y, s.cx, s.cy) - (s.radius || 8)); return best; };
const k0 = A.kill; A.kill = function (a, by, c) {
  const was = a && !a.dead; const st = a && a.state, tg = a && a.target; const r = k0.apply(this, arguments);
  if (was && a.dead && wild(a.kind) && !a.dom) {
    const man = by && G.S.villagers.has(by.id); const why = by ? (man ? 'gente' : 'bicho') : (c || '?'); note(D, a.kind, why); cause[why] = (cause[why] || 0) + 1;
    if (man && process.env.POR) { const d = ringOf(a); const t = by.task || {}; note(P, a.kind, `${t.type || '-'}${t.why ? '/' + t.why : ''} | fera ${st}${tg === by.id ? '→ele' : ''} | ${d < 0 ? 'na cidade' : d < 4 ? 'na beira' : d < 15 ? 'perto' : 'no mato'}`); }
  }
  return r;
};
const s0 = A.spawn; A.spawn = function (k, x, y, o) { const a = s0.apply(this, arguments); if (a && wild(k)) note(B, k, o && o.age === 0 && o.grown < 1 ? 'cria' : 'outro'); return a; };
const ks = () => A.ids.filter(k => wild(k) && A.capacity(k) > 0);
// (the skip counts whole years: M.saltar(0.5) is a year, not half of one)
for (let h = 1; h <= years; h++) {
  M.saltar(1); const c = A.counts(); for (const k of ks()) if (!(c[k] > 0)) Z[k] = (Z[k] || 0) + 1;
  if (h % 20 === 0) { const l = ks(); const dead = l.filter(k => !(c[k] > 0)); console.log(`ano ${G.S.day}: ${l.length - dead.length}/${l.length} vivas (o f2 pede ${Math.ceil(l.length * 0.9)})${dead.length ? '; extintas agora: ' + dead.join(' ') : ''}`); }
}
const c = A.counts();
console.log(`mortes por causa: ${JSON.stringify(cause)}`);
for (const k of ks().sort()) console.log(`${k.padEnd(12)} teto ${String(A.capacity(k)).padStart(3)} vivos ${String(c[k] || 0).padStart(3)} | extinta ${String(Z[k] || 0).padStart(3)} de ${years} anos | nasc ${JSON.stringify(B[k] || {})} | mortes ${JSON.stringify(D[k] || {})}`);
if (process.env.POR) for (const k of Object.keys(P).sort()) { console.log(`mortos por gente: ${k}`); for (const [w, n] of Object.entries(P[k]).sort((a, b) => b[1] - a[1])) console.log(`   ${String(n).padStart(3)}  ${w}`); }
const e = M.erros(); console.log(`erros de módulo ${JSON.stringify(e.mod)}`);
