// docas: onde nasce um cais (L-189).   node qa/docas.js
// O City.dockSite contava a volta do lote 2×2 com os cantos duas vezes: uma casa de mar num canto passava, e um cais nascia
// com água só na diagonal — o Naval.dockInfo não achava água de lado nenhum, ficava com o leste, e o píer saía sobre areia
// e rocha (a doca#15013 da metrópole). d1 em mundos novos de vários tipos, todo lugar que a regra aceita (City.dockOk) tem
// água de lado; d2 o cais que o dockSite escolhe olha para a água (o lado do dockInfo tem água); d3 o mesmo nos mundos prontos.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | docas ${name} | ${info}`); if (!c) fails.push(name); };
const N = () => G.N;
const seaAt = (x, y) => G.W.inb(x, y) && G.S.type[y * N() + x] <= G.T.SEA;
// the water on the sides of a 2×2 lot (each side tile once), as the dockInfo looks for it
const sideWater = (x, y) => { let n = 0; for (let k = 0; k < 2; k++) n += seaAt(x - 1, y + k) + seaAt(x + 2, y + k) + seaAt(x + k, y - 1) + seaAt(x + k, y + 2); return n; };
const facing = b => { const d = b.wd || [1, 0]; let n = 0; for (let k = 0; k < b.w; k++) { const x = d[0] > 0 ? b.x + b.w : d[0] < 0 ? b.x - 1 : b.x + k, y = d[1] > 0 ? b.y + b.h : d[1] < 0 ? b.y - 1 : b.y + k; if (seaAt(x, y)) n++; } return n; };
// every lot the rule accepts around the towns, and the site the town would pick
const survey = () => {
  let lots = 0, bad = 0, picked = 0, pickBad = 0; const ex = [];
  for (const set of G.S.settlements.values()) {
    const R = Math.min(18, Math.round((set.radius || 8) + 4)); const cx = Math.floor(set.cx), cy = Math.floor(set.cy);
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const x = cx + dx, y = cy + dy; if (!G.City.dockOk(x, y)) continue; lots++; if (!sideWater(x, y)) { bad++; if (ex.length < 3) ex.push(`${x},${y}`); } }
    const r0 = G.S.rng; const site = G.City.dockSite(set); G.S.rng = r0; // (asking where it would go draws from the world's chance: give it back)
    if (site) { picked++; if (!sideWater(site[0], site[1])) { pickBad++; if (ex.length < 6) ex.push(`escolhido ${site}`); } }
  }
  return { lots, bad, picked, pickBad, ex };
};
const worlds = [['ilha', 64, 3], ['arquipelago', 128, 5], ['continente', 128, 7], ['ilha', 96, 11], ['arquipelago', 96, 13]];
let L = 0, B = 0, P = 0, PB = 0; const EX = [];
for (const [type, size, seed] of worlds) {
  M.novo({ seed, type, size, tribes: 3 }); M.viver(20);
  const r = survey(); L += r.lots; B += r.bad; P += r.picked; PB += r.pickBad; EX.push(...r.ex.map(e => `${type}/${seed} ${e}`));
}
ok('d1 os lugares aceitos', L > 0 && !B, `${L} lotes aceitos em ${worlds.length} mundos novos; ${B} sem água de lado${EX.length ? ': ' + EX.slice(0, 4).join(' · ') : ''}`);
ok('d2 o cais escolhido olha para a água', P > 0 && !PB, `${P} cidades com lugar de cais; ${PB} escolhidos sem água de lado`);
// the quays a ready world already has: each one built after this rule faces the water (an old world may keep an old one)
for (const key of ['cidade', 'metropole', 'mega', 'anos100']) {
  try { M.pronto(key); } catch (e) { ok('d3 ' + key, false, 'não abriu: ' + e.message); continue; }
  const docks = [...G.S.buildings.values()].filter(b => b.type === 'doca' && b.built);
  for (const b of docks) G.Naval.dockInfo(b);
  const dry = docks.filter(b => !facing(b)).map(b => `doca#${b.id}`);
  const r = survey();
  ok('d3 ' + key, !r.bad && !r.pickBad, `${r.lots} lotes aceitos, ${r.bad} sem água de lado; ${docks.length} cais de pé, ${dry.length} sem água no lado do píer${dry.length ? ' (' + dry.slice(0, 4).join(', ') + ' — de antes desta regra)' : ''}`);
}
const e = M.erros(); const mods = Object.keys(e.mod);
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
