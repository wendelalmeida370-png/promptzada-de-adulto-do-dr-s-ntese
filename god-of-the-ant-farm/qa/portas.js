// portas: as portas dos interiores (G.Depot.stores pelos móveis, a porta das pessoas pela planta) desligadas e ligadas, o
// mesmo mundo lado a lado: a gente, os nascimentos e as mortes (de fome à parte), a comida e o estoque, as construções, o
// comércio, o que não coube nos móveis e o tempo do salto — ano a ano, para explicar cada diferença antes de ligar.
//   node qa/portas.js [anos] [mundo,mundo...]      (mundo: um pronto — cidade, metropole… — ou semente:tipo:tamanho:povos)
//   PORTAS=liga|desliga  só um dos lados
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const YEARS = +(process.argv[2] || 20);
const LIST = (process.argv[3] || '103:continente:128:4,cidade,metropole').split(',');
// (desliga*: desligadas, o mundo empurrado por um sorteio a mais do acaso do mundo logo ao abrir — o mesmo mundo, outro
// futuro: a diferença entre desliga e desliga* é o tamanho do acaso em 20 anos, a régua das diferenças de liga)
const SIDES = process.env.PORTAS === 'liga' ? ['liga'] : process.env.PORTAS === 'desliga' ? ['desliga'] : ['desliga', 'desliga*', 'liga'];
const In = G.Interiors, D = G.Depot;
const clock = () => Number(process.hrtime.bigint() / 1000000n);
// (the refusals of the store for want of room, by the kind of holder that refused: the measure of what the furniture changes)
const refused = { h: 0, b: 0, z: 0, outro: 0 }; let moved = 0; const sale = { n: 0, rev: 0 };
for (const f of ['move', 'make']) {
  const orig = D[f]; if (!orig) continue;
  D[f] = function (...a) {
    const r = orig.apply(this, a); moved++;
    if (r && !r.ok && r.why === 'não cabe') { const to = f === 'move' ? a[1] : a[0]; const k = typeof to === 'string' ? to.split(':')[0] : 'outro'; refused[k in refused ? k : 'outro']++; }
    return r;
  };
}
// (the sales of the stalls: a swap of the goods for their price, the ledger's 'venda')
{ const orig = D.swap; D.swap = function (x, y, c) { const r = orig.apply(this, [x, y, c]); if (r && r.ok && c && c.code === 'venda') { sale.n++; if (y && y[2] === 'moedas') sale.rev += y[3] || 0; } else if (r && !r.ok && r.why === 'não cabe') refused.outro++; return r; }; }
const open = key => { if (/^\d+:/.test(key)) { const [seed, type, size, tribes] = key.split(':'); M.novo({ seed: +seed, type, size: +size, tribes: +tribes, temper: 'normal' }); } else M.pronto(key); };
const ports = on => { D.stores = on ? In.depotStores : null; G.Vg.planDoor = on ? In.planDoor : null; };
function snap() {
  const S = G.S; let food = 0, stock = 0, pantry = 0, coin = 0, inv = 0, homes = 0, built = 0, ex = 0, im = 0;
  for (const f of G.Fac.all()) { for (const k in f.stock) { const n = f.stock[k] || 0; stock += n; if (k === 'food') food += n; } ex += f.exports || 0; im += f.imports || 0; }
  for (const b of S.buildings.values()) {
    if (b.built) built++;
    if (G.BDEF[b.type] && G.BDEF[b.type].housing) { homes++; pantry += b.pantry || 0; coin += b.coin || 0; for (const k in b.inv || {}) inv += b.inv[k] || 0; }
  }
  const biz = (S.biz || []).filter(z => z.st !== 'fim').length;
  return { vendas: sale.n, receita: Math.round(sale.rev), pop: S.villagers.size, births: S.stats.births, deaths: S.stats.deaths, food: Math.round(food), stock: Math.round(stock), pantry: Math.round(pantry), coin: Math.round(coin), inv: Math.round(inv), homes, built, biz, ex: Math.round(ex), im: Math.round(im) };
}
const hunger = d0 => { let n = 0; for (const r of G.S.dead.values()) if (r.cause === 'hunger' && r.died >= d0) n++; return n; };
const rows = {};
for (const key of LIST) for (const side of SIDES) {
  open(key); ports(side === 'liga'); if (side === 'desliga*') G.R(); const d0 = G.S.day; const t0 = clock(); const r0 = Object.assign({}, refused); const m0 = moved; sale.n = 0; sale.rev = 0;
  const out = [Object.assign({ ano: 0, fome: 0, ms: 0, naoCabe: 0 }, snap())];
  for (let y = 1; y <= YEARS; y++) {
    const a = clock(); M.saltar(1);
    out.push(Object.assign({ ano: y, fome: hunger(d0), ms: clock() - a, naoCabe: refused.h + refused.b + refused.z + refused.outro - (r0.h + r0.b + r0.z + r0.outro) }, snap()));
  }
  rows[key + '/' + side] = { out, refused: { h: refused.h - r0.h, b: refused.b - r0.b, z: refused.z - r0.z }, moves: moved - m0, ms: clock() - t0, limpo: M.limpo(), err: JSON.stringify(G.modErr || {}) };
  console.log(`${key} portas ${side}: ${YEARS} anos em ${((clock() - t0) / 1000).toFixed(0)} s; erros de módulo ${rows[key + '/' + side].err}`);
}
// side by side, every fifth year and the last
const F = ['pop', 'births', 'deaths', 'fome', 'food', 'pantry', 'stock', 'inv', 'coin', 'homes', 'built', 'biz', 'vendas', 'receita', 'ex', 'im', 'naoCabe', 'ms'];
for (const key of LIST) {
  console.log(`\n== ${key}`);
  console.log(['ano'].concat(F).map(s => s.padStart(8)).join(''));
  for (let y = 0; y <= YEARS; y++) {
    if (y % 5 && y !== YEARS) continue;
    for (const side of SIDES) { const r = rows[key + '/' + side]; if (!r) continue; const o = r.out[y]; console.log([`${y}${side === 'liga' ? '+' : side === 'desliga*' ? '*' : '-'}`].concat(F.map(f => o[f])).map(s => String(s).padStart(8)).join('')); }
  }
  for (const side of SIDES) { const r = rows[key + '/' + side]; if (r) console.log(`  ${side}: não coube (casa ${r.refused.h}, prédio ${r.refused.b}, banca ${r.refused.z}) em ${r.moves} movimentos; ${(r.ms / 1000).toFixed(0)} s`); }
}
if (process.env.JSON) require('fs').writeFileSync(process.env.JSON, JSON.stringify(rows));
const bad = Object.values(rows).some(r => !r.limpo);
console.log(bad ? 'FALHOU: erro de módulo ou no console' : 'PASSOU (só mede: as diferenças se explicam no relatório)');
process.exit(bad ? 1 : 0);
