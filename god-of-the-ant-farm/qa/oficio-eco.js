// oficio-eco: o medidor da economia para quem mexe no repartidor de ofícios (D-210 a D-214). Não é uma prova: mede.
//   node qa/oficio-eco.js [sementes=103,7,2024,11,42,555,9,31,77,314] [anos=40] [tipo=continente] [tam=128] [povos=4]
//   node qa/oficio-eco.js pronto:metropole [dias=10]
// Cada mundo do zero no salto, um ano por vez; no fim de cada um: a gente, os mortos de guerra e de fome, o que se produziu,
// os prédios, as cidades, a comida por pessoa mais baixa de um povo (olhada a cada ano) e as armas — dos adultos dos povos em
// guerra e dos povos em paz, quantos são guerreiros (olhados a cada ano), e os mortos de guerra por povo-ano em guerra. No fim,
// a soma. Um mundo pronto é vivido no passo, com as armas olhadas a cada quarto de dia.
// Rode no jogo de antes da mudança e no de depois, com as mesmas sementes, e compare as somas: mundo a mundo o acaso das
// guerras dá uns ±37 de gente e ±11 mortos de guerra (o desvio das diferenças, medido em dez mundos de 40 anos), e só a soma
// e as armas dizem alguma coisa. Foi a conta das armas, não a soma da gente, que mostrou o exército que não voltava para casa
// (D-211): 20,8 % dos adultos dos povos em guerra e 2,9 % dos povos em paz eram guerreiros, e cada povo-ano de guerra matava
// 2,5 (o jogo em b2b61f0, as dez sementes).
const M = require('./nodemundo.js'); const G = M.load({ qa: true });
const a2 = process.argv[2] || '103,7,2024,11,42,555,9,31,77,314';
let causes = {}; const kill0 = G.Village.kill;
G.Village.kill = function (v, cause) { causes[cause] = (causes[cause] || 0) + 1; return kill0.apply(this, arguments); };
const grown = v => v.age >= 16 && v.age < 62 && !v.captive;
// the arms, one look: the peoples alive, the ones at war, and the warriors among the grown hands of each kind
const arms = () => ({ n: 0, povos: 0, guerra: 0, gG: 0, aG: 0, gP: 0, aP: 0 });
const look = o => {
  const S = G.S; o.n++; const war = new Set();
  for (const f of S.factions.values()) { if (f.alive === false || G.Fac.pop(f.id) < 1) continue; o.povos++; if (G.Fac.enemiesOf(f.id).length) { war.add(f.id); o.guerra++; } }
  for (const v of S.villagers.values()) {
    if (!grown(v)) continue; const st = S.settlements.get(v.set); if (!st) continue;
    if (war.has(st.fac)) { o.aG++; if (v.role === 'guerreiro') o.gG++; } else { o.aP++; if (v.role === 'guerreiro') o.gP++; }
  }
};
const pct = (a, b) => (b ? (100 * a / b).toFixed(1) : '—') + ' %';
const armsLine = (o, war) => `povos-olhar em guerra ${o.guerra} de ${o.povos} (${pct(o.guerra, o.povos)}); guerreiros entre os adultos — em guerra ${o.gG} de ${o.aG} (${pct(o.gG, o.aG)}), em paz ${o.gP} de ${o.aP} (${pct(o.gP, o.aP)}); mortos de guerra por povo-olhar em guerra ${o.guerra ? (war / o.guerra).toFixed(2) : '—'}`;
const count = () => {
  const S = G.S; let built = 0; for (const b of S.buildings.values()) if (b.built && b.type !== 'ruin') built++;
  const st = S.stats;
  return { gente: S.villagers.size, adultos: [...S.villagers.values()].filter(grown).length, guerra: causes.war || 0, flecha: causes.arrow || 0, fome: causes.hunger || 0, comida: Math.round(st.foodProduced), madeira: Math.round(st.woodProduced), pedra: Math.round(st.stoneProduced), predios: built, cidades: S.settlements.size };
};
const say = (tag, c) => `${tag}: gente ${c.gente} (adultos ${c.adultos}) | mortos de guerra ${c.guerra} (e de flecha ${c.flecha}), de fome ${c.fome} | produzido: comida ${c.comida}, madeira ${c.madeira}, pedra ${c.pedra} | prédios ${c.predios} | cidades ${c.cidades}`;
let bad = false;
if (/^pronto:/.test(a2)) {
  const key = a2.slice(7), dias = +(process.argv[3] || 10); M.pronto(key); causes = {}; const c0 = count(); const o = arms(); let worst = 0;
  console.log(say(`${key}, o instante salvo`, c0));
  const n = Math.round(dias * G.DAY_LEN / 0.1);
  for (let k = 0; k < n; k++) { G.debug.step(0.1); if (k % 500 === 0) { look(o); let h = 0; for (const v of G.S.villagers.values()) if (v.hunger >= 80) h++; if (h > worst) worst = h; } }
  const c = count(); console.log(say(`${key}, ${dias} dias depois`, c));
  console.log(`  nesses dias: comida ${c.comida - c0.comida}, madeira ${c.madeira - c0.madeira}, pedra ${c.pedra - c0.pedra}; o pior instante: ${worst} pessoas com fome (80 ou mais); mortes por causa: ${Object.entries(causes).sort((x, y) => y[1] - x[1]).map(([k, q]) => k + ' ' + q).join(', ') || 'nenhuma'}`);
  console.log('  as armas: ' + armsLine(o, c.guerra));
  bad = !M.limpo();
} else {
  const seeds = a2.split(',').map(Number), anos = +(process.argv[3] || 40), type = process.argv[4] || 'continente', size = +(process.argv[5] || 128), tribes = +(process.argv[6] || 4);
  const sum = { gente: 0, adultos: 0, guerra: 0, flecha: 0, fome: 0, comida: 0, madeira: 0, pedra: 0, predios: 0, cidades: 0 }; const all = arms(); let lowAll = Infinity;
  for (const seed of seeds) {
    M.novo({ seed, type, size, tribes }); causes = {}; const o = arms(); let low = Infinity;
    for (let y = 1; y <= anos; y++) {
      M.saltar(1); look(o);
      for (const f of G.S.factions.values()) { const p = G.Fac.pop(f.id); if (p < 4 || f.alive === false) continue; const x = (f.stock.food || 0) / p; if (x < low) low = x; }
    }
    const c = count(); for (const k in sum) sum[k] += c[k]; for (const k in all) all[k] += o[k]; if (low < lowAll) lowAll = low;
    console.log(say(`semente ${seed}, ano ${anos}`, c) + ` | a comida por pessoa mais baixa de um povo ${low.toFixed(2)}`);
    console.log('  as armas: ' + armsLine(o, c.guerra));
    if (!M.limpo()) { bad = true; console.log('  ERROS: ' + JSON.stringify(M.erros()).slice(0, 300)); }
  }
  console.log(say(`SOMA (${seeds.length} mundos, ${type} ${size}, ${tribes} povos, ${anos} anos)`, sum) + ` | a comida por pessoa mais baixa ${lowAll.toFixed(2)}`);
  console.log('  as armas: ' + armsLine(all, sum.guerra));
}
if (bad) console.log('ERROS: ' + JSON.stringify(M.erros()).slice(0, 500));
process.exit(bad ? 1 : 0);
