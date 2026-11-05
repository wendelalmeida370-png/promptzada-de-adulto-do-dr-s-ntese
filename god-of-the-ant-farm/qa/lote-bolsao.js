// lote-bolsao: node qa/lote-bolsao.js — o lugar de obra que a cidade só alcança pela quina do anel, ou ao lado de um bolsão
// (L-543; o passo que não corta a quina de um prédio é outra coisa: quina.js, L-354). O mapa
// de alcance anda só para o norte, o sul, o leste e o oeste: a quina do anel de um lote não encosta em nenhuma casa dele, e quem
// sai pela porta de um prédio pisa na casa do lado do lote, não ao lado dela. Uma casa de Mênfis, no mega da geração 14, foi
// fundada onde a cidade só chegava a uma quina e a uma diagonal do único lado aberto — um bolsão de uma casa entre penhascos —:
// a porta foi para lá, e a família nunca mais saiu (o emissário do fundadores f4 era dela).
// q1 o caso de propósito, num mundo pronto: um lote de uma casa, em chão aberto da cidade; a mão da prova põe penhascos em
//    três lados dele e em volta do quarto, que fica um bolsão de uma casa, com a cidade numa quina do anel e numa diagonal do
//    bolsão — a regra de antes diria sim —: o V.siteReached diz não; com um lado aberto de novo para a rua, diz sim
// q2 os lugares que o buscador dá, nos mundos prontos, para os tipos que uma cidade mais ergue: cada um tem um lado do lote no
//    chão da cidade — lido pela prova casa a casa no mapa de regiões, não pelo V.siteReached
// q3 dois anos de salto na metrópole: todo lugar que o mundo pede ao buscador tem, na hora, um lado do lote no chão da cidade;
//    o verificador limpo e nenhum erro de módulo
// q4 a corte pergunta o alcance do lote do grande palácio e do colossal também no degrau do próprio tipo (L-544): o lote que
//    ela dá, dito fora do alcance das ruas, nunca é dado de novo — a mesma busca, com os mesmos sorteios do mundo
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/possess.js'] });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | lote-bolsao ${name} | ${info}`); if (!c) fails.push(name); };
const sides = (x, y, w, h) => { const out = []; for (let k = 0; k < w; k++) out.push([x + k, y - 1], [x + k, y + h]); for (let k = 0; k < h; k++) out.push([x - 1, y + k], [x + w, y + k]); return out; };
const corners = (x, y, w, h) => [[x - 1, y - 1], [x + w, y - 1], [x - 1, y + h], [x + w, y + h]];
// (a side of the lot on the town's own ground: a tile one walks, in the town's region of the map — the test's own reading)
const onGround = (set, x, y, w, h) => { const W = G.W, L = W.reachIds(), r = W.townRegion(set); return sides(x, y, w, h).some(([a, b]) => W.inb(a, b) && W.walkable(W.idx(a, b)) && L[W.idx(a, b)] === r); };
// (the rule of before: any tile of the ring, the corners too, from which the town reaches the tile or beside it)
const before = (set, x, y, w, h) => { const W = G.W; return sides(x, y, w, h).concat(corners(x, y, w, h)).some(([a, b]) => W.inb(a, b) && W.walkable(W.idx(a, b)) && W.townReaches(set, a + 0.5, b + 0.5)); };

// ---- q1: the pocket made on purpose
{
  M.pronto('cidade'); const S = G.S, W = G.W, V = G.Village, N = G.N;
  const set = [...S.settlements.values()].filter(s => G.Fac.get(s.fac)).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id)[0];
  const r = W.townRegion(set); const L = W.reachIds();
  // (a lot with open ground of the town all round it, three tiles to the west and two to the other sides: no building, no
  // water, no street, no wall — the cliffs the test's hand lays there shut nothing else)
  const open = (a, b) => { if (!W.inb(a, b)) return false; const i = W.idx(a, b); return W.walkable(i) && L[i] === r && !S.occ[i] && !S.road[i] && !S.wall[i] && !S.cliff[i] && S.type[i] >= G.T.SAND; };
  let lot = null;
  for (let d = 2; d < 30 && !lot; d++) for (let dy = -d; dy <= d && !lot; dy++) for (let dx = -d; dx <= d && !lot; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== d) continue;
    const x = Math.floor(set.cx) + dx, y = Math.floor(set.cy) + dy; let all = true;
    for (let b = y - 2; b <= y + 2 && all; b++) for (let a = x - 3; a <= x + 2; a++) if (!open(a, b)) { all = false; break; }
    if (all) lot = [x, y];
  }
  if (!lot) ok('q1 o lote só pela quina', false, `${set.name}: nenhum chão aberto de 6×5 casas perto do centro`);
  else {
    const [x, y] = lot; const P = [x - 1, y];
    // three sides of the lot, and the pocket's other three neighbours: cliffs (the corner (x+1, y+1) and the pocket's diagonal
    // (x-2, y+1) stay open, on the town's ground)
    const wall = [[x, y - 1], [x + 1, y], [x, y + 1], [x - 2, y], [x - 1, y - 1], [x - 1, y + 1]];
    const lay = c => { for (const [a, b] of wall) S.cliff[W.idx(a, b)] = c; S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); };
    lay(1);
    const L2 = W.reachIds(); const pocket = L2[W.idx(P[0], P[1])] !== W.townRegion(set);
    const old = before(set, x, y, 1, 1), now = V.siteReached(set, x, y, { w: 1, h: 1 });
    // a side open again to the street: the south one
    S.cliff[W.idx(x, y + 1)] = 0; S.typeVer++; W.invalidateLand();
    const back = V.siteReached(set, x, y, { w: 1, h: 1 }), mine = onGround(set, x, y, 1, 1);
    lay(0);
    ok('q1 o lote só pela quina: o buscador não o dá; com um lado para a rua, dá', pocket && old && !now && back && mine,
      `${set.name}: lote em ${x},${y}, o bolsão em ${P[0]},${P[1]} ${pocket ? 'fora do chão da cidade' : 'NO chão da cidade'}; a regra de antes ${old ? 'diria sim' : 'diria não'}; o siteReached ${now ? 'DIZ SIM' : 'diz não'}; com o lado sul aberto, ${back ? 'diz sim' : 'DIZ NÃO'}`);
  }
}

// ---- q2: the sites the finder gives in the ready worlds, read tile by tile
{
  const KINDS = ['house', 'hut', 'sobrado', 'insula', 'quarteirao', 'storehouse', 'workshop', 'well', 'farm', 'temple', 'taverna', 'praca', 'mercado'].filter(t => G.BDEF[t]);
  let asked = 0, got = 0, judged = 0; const bad = [];
  for (const k of ['cidade', 'metropole', 'anos100', 'mega']) {
    M.pronto(k); const S = G.S, V = G.Village; G.inSim++;
    try {
      for (const s of [...S.settlements.values()].filter(q => G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) {
        if (G.W.townRegion(s) < 0) continue; // (a town the map cannot place: not judged)
        for (const t of KINDS) { asked++; s._noSite = {}; const p = V.findSite(s, t); s._noSite = {}; if (!p) continue; got++; const d = G.BDEF[t]; judged++; if (!onGround(s, p[0], p[1], d.w, d.h)) bad.push(`${k}: ${s.name} ${t} em ${p[0]},${p[1]}`); }
      }
    } finally { G.inSim--; }
  }
  ok('q2 os lugares do buscador nos mundos prontos têm um lado no chão da cidade', judged > 0 && !bad.length, `${asked} pedidos, ${got} lugares: ${bad.length ? bad.length + ' sem lado no chão da cidade — ' + bad.slice(0, 4).join(' · ') : 'todos com um lado no chão da cidade'}`);
}

// ---- q3: two years of the skip, every site the world asks for checked as it is given
{
  M.pronto('metropole'); const S = G.S, V = G.Village; const d0 = S.day;
  const OWN = { doca: 1, mina: 1, salina: 1, perolaria: 1 }; // (sites with rules of their own: the shore, the ore, the reef)
  let n = 0; const bad = []; const find = V.findSite;
  V.findSite = function (set, type, reach, sz) {
    const p = find.apply(this, arguments);
    if (p && !OWN[type] && G.W.townRegion(set) >= 0) { const d = G.BDEF[type]; const w = sz || d.w; n++; if (!onGround(set, p[0], p[1], w, sz || d.h)) bad.push(`dia ${S.day.toFixed(1)}: ${set.name} ${type} em ${p[0]},${p[1]}`); }
    return p;
  };
  let errs = 0;
  try { M.saltar(2); } finally { V.findSite = find; }
  const chk = QA.check().filter(q => q.sev <= 2).map(q => q.msg); errs = Object.keys(G.modErr || {}).length;
  ok('q3 dois anos de salto: todo lugar dado tem um lado no chão da cidade', n > 0 && !bad.length && !chk.length && !errs && M.limpo(),
    `metrópole, do dia ${d0} ao ${Math.floor(S.day)}: ${n} lugares dados, ${bad.length ? bad.length + ' sem lado no chão da cidade — ' + bad.slice(0, 3).join(' · ') : 'todos com um lado no chão da cidade'}; ${chk.length ? 'o verificador: ' + chk.slice(0, 2).join(' | ') : 'verificador limpo'}${errs ? '; erro de módulo: ' + Object.keys(G.modErr).join(', ') : ''}`);
}

// ---- q4: the court asks the reach of the lot of its vain palaces at the type's own step too (L-544): the lot it gives, said
// out of the streets' reach, is never given again — the same search, on the same draws of the world
{
  M.pronto('metropole'); const S = G.S, V = G.Village, Co = G.Court; G.inSim++;
  let sites = 0, asked = 0, moved = 0; const bad = []; const real = V.siteReached;
  try {
    for (const s of [...S.settlements.values()].filter(q => G.Fac.get(q.fac)).sort((a, b) => a.id - b.id)) for (const t of ['grande_palacio', 'palacio_colossal']) {
      const r0 = S.rng; const p = Co.site(s, t); S.rng = r0; if (!p) continue; sites++; const w = G.BDEF[t].w;
      let seen = false; V.siteReached = (set, x, y, def) => { if (set === s && x === p[0] && y === p[1] && def.w === w) { seen = true; return false; } return real(set, x, y, def); };
      let q = null; try { q = Co.site(s, t); } finally { V.siteReached = real; S.rng = r0; }
      if (seen) asked++; if (!q || q[0] !== p[0] || q[1] !== p[1]) moved++; else bad.push(`${s.name} ${t} em ${p[0]},${p[1]}`);
    }
  } finally { V.siteReached = real; G.inSim--; }
  ok('q4 a corte pergunta o alcance do lote do palácio no degrau do próprio tipo também', sites > 0 && asked === sites && moved === sites,
    `metrópole: ${sites} lotes do grande palácio e do colossal no degrau de cada um; ${asked} perguntados ao alcance das ruas; dito fora do alcance, ${moved} foram para outro lugar${bad.length ? ' — DADOS DE NOVO: ' + bad.slice(0, 3).join(' · ') : ''}`);
}
console.log(fails.length ? `LOTE-BOLSAO: ${fails.length} falha(s)` : 'LOTE-BOLSAO: ok');
process.exit(fails.length ? 1 : 0);
