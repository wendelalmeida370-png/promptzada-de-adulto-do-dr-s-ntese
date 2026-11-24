// conta: os prédios por tipo nos mundos prontos (cidade, metrópole, megalópole), por povo e por degrau, e por cidade
// node conta.js [mundo,…] > conta.json   (só lê; os mundos são abertos pelo menu do jogo em Node)
const M = require('../nodemundo.js');
const G = M.load({ qa: true }); const In = G.Interiors;
const worlds = (process.argv[2] || 'cidade,metropole,mega').split(',');
const out = {};
for (const w of worlds) {
  M.pronto(w); const S = G.S;
  const o = { day: S.day, pop: S.villagers.size, towns: [], byType: {} };
  const setOf = new Map();
  for (const s of S.settlements.values()) {
    const pop = G.Village.pop(s.id);
    const f = G.Fac.get(G.Village.facOfSet(s.id));
    setOf.set(s.id, s);
    o.towns.push({ id: s.id, name: s.name, tier: s.tier || 0, pop, civ: G.Civ.idOfFac(G.Village.facOfSet(s.id)) || '?', fac: f ? f.name : '?' });
  }
  for (const b of S.buildings.values()) {
    const t = b.type; const r = o.byType[t] || (o.byType[t] = { all: 0, built: 0, styles: {}, esc: {}, n: {}, fams: {}, plan: 0, towns: {} });
    r.all++; if (b.built) r.built++;
    r.styles[b.style || '?'] = (r.styles[b.style || '?'] || 0) + 1;
    r.esc[b.esc || '?'] = (r.esc[b.esc || '?'] || 0) + 1;
    r.n[b.w] = (r.n[b.w] || 0) + 1;
    if (b.ip && In.TYPES[b.ip.t]) { r.plan++; const f = b.ip.f || '?'; r.fams[f] = (r.fams[f] || 0) + 1; }
    r.towns[b.set] = (r.towns[b.set] || 0) + 1;
  }
  o.towns.sort((a, b) => b.pop - a.pop);
  out[w] = o;
}
console.log(JSON.stringify(out, null, 1));
if (!M.limpo()) console.error('erros', JSON.stringify(M.erros()).slice(0, 400));
