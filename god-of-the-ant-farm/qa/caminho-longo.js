// caminho-longo: node qa/caminho-longo.js [mundo] — um caminho longo que o mapa diz aberto é achado (L-343).
// A busca exata (W.findPath com o W.PATH_EXACT) se espalha pelo chão em volta de quem procura, e o orçamento dela (3500 casas)
// acaba antes de achar um caminho longo que sai de uma cidade murada ou contorna um lago: na metrópole de antes de 28/10, Liv,
// de Hedeby, voltando de uma caravana, ficou dois minutos dentro dos muros da cidade com que tinha negociado, cada busca do
// caminho de casa gasta (o S3 «9 caminhos falhos seguidos» do agua-solta), e depois ficou por lá. Agora o Vg.goto busca de novo,
// uma vez, mais guloso (como o salto busca todo caminho), quando o caminho é longo e o mapa de regiões diz que se chega.
//  l1 o caso da Liv, montado: alguém posto no meio de uma cidade murada longe da sua, o caminho de casa (a frente do armazém)
//     que o mapa diz aberto e a busca exata sozinha não acha no orçamento: o Vg.goto acha
//  l2 ela vive o mundo dali: chega à cidade dela, sem 6 caminhos falhos seguidos
//  l3 300 pares longos (24 casas ou mais) do mundo, de pessoas a portas de prédios: todo par que tem caminho (a busca sem
//     orçamento) o Vg.goto acha; quantos a busca exata sozinha acharia, e o tempo das duas
//  e o verificador limpo (S0–S3 novos), sem erro de módulo.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | caminho-longo ${name} | ${info}`); if (!c) fails.push(name); };
const S = M.pronto(process.argv[2] || 'metropole'); const W = G.W, N = G.N, V = G.Village, Vg = G.Vg;
const base = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
const fresh = () => QA.check().filter(q => q.sev <= 3 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const exact = (sx, sy, tx, ty, adj) => !!W.findPath(sx, sy, tx, ty, adj, 3500, W.PATH_EXACT);
const truth = (sx, sy, tx, ty, adj) => !!W.findPath(sx, sy, tx, ty, adj, N * N * 4, W.PATH_EXACT);
const home = s => { const d = V.nearestDropoff(s.cx, s.cy, s.id) || S.buildings.get(s.campfire); return d ? V.frontTile(d) : null; };

// l1 — the case: a town A, a walled town B far from it, a spot inside B's walls (its heart, open ground of A's land) from
// which the way to A's store is open by the map and too long for the exact search
let pick = null;
{
  const walled = S.walls.filter(w => w.done && w.tiles.some(i => S.wall[i] === 1)).map(w => S.settlements.get(w.set)).filter(Boolean).sort((a, b) => a.id - b.id);
  const towns = [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && home(s)).sort((a, b) => a.id - b.id);
  for (const b of walled) {
    const box = G.Siege.wallOf(b.id).box; let spot = null;
    for (let r = 0; r < 6 && !spot; r++) for (let dy = -r; dy <= r && !spot; dy++) for (let dx = -r; dx <= r && !spot; dx++) { const x = Math.floor(b.cx) + dx + 0.5, y = Math.floor(b.cy) + dy + 0.5; if (x > box[0] + 1 && x < box[2] && y > box[1] + 1 && y < box[3] && W.walkableXY(x, y) && !S.occ[W.idx(x, y)]) spot = [x, y]; }
    if (!spot) continue;
    for (const a of towns) {
      if (a.id === b.id) continue; const t = home(a); const d = G.dist(spot[0], spot[1], t[0], t[1]); if (d < 40) continue;
      if (!W.canWalk(spot[0], spot[1], t[0], t[1], true) || exact(spot[0], spot[1], t[0], t[1], true)) continue;
      if (!pick || d > pick.d) pick = { a, b, spot, t, d };
    }
  }
}
const who = pick && [...S.villagers.values()].filter(v => v.set === pick.a.id && v.age >= 18 && v.age < 50 && !v.captive && !v.aboard && !v.ug && !v.jail && !v.inside && !(S.avatar && S.avatar.id === v.id)).sort((p, q) => p.id - q.id)[0];
if (!pick || !who) ok('l1 o caminho de casa de dentro de uma cidade murada longe: o mapa diz aberto, a busca exata não acha, o Vg.goto acha', false, !pick ? 'nenhum par de cidade murada e cidade longe com o caminho longo demais para a busca exata' : 'a cidade não tem adulto livre');
else {
  const { a, b, spot, t, d } = pick;
  Vg.endTask(who); who.x = spot[0]; who.y = spot[1]; who.path = null; who._pfN = 0; who._pfI = -1; who.carry = who.carry && who.carry.n > 0 ? who.carry : null;
  const found = Vg.goto(who, t[0], t[1], true); const len = found && who.path ? who.path.length : 0; who.path = null;
  ok('l1 o caminho de casa de dentro de uma cidade murada longe: o mapa diz aberto, a busca exata não acha, o Vg.goto acha', found,
    `${who.name} de ${a.name}, no meio de ${b.name} (dentro dos muros), a ${d.toFixed(0)} casas da frente do armazém de casa: a busca exata (3500) não acha; o Vg.goto ${found ? 'acha (' + len + ' pontos)' : 'NÃO acha'}`);
  // l2 — she lives the world from there: home, never six failed searches in a row
  let maxPf = 0, n = 0; const atHome = () => G.dist(who.x, who.y, a.cx, a.cy) < (a.radius || 8) + 4;
  while (n++ < 4000 && S.villagers.has(who.id) && !atHome()) { G.debug.step(0.1); maxPf = Math.max(maxPf, who._pfN || 0); }
  ok('l2 ela vive o mundo dali: chega à cidade dela, sem 6 caminhos falhos seguidos', S.villagers.has(who.id) && atHome() && maxPf < 6,
    `${S.villagers.has(who.id) ? (atHome() ? 'em ' + a.name + ' em ' + (n / 10).toFixed(0) + ' s' : 'NÃO chegou em 400 s (a ' + G.dist(who.x, who.y, a.cx, a.cy).toFixed(0) + ' casas)') : 'morreu no caminho'}; caminhos falhos seguidos no máximo ${maxPf}`);
}

// l3 — long pairs of the world, from people to doors of buildings (a fixed stride, the same pairs every time)
{
  const from = [...S.villagers.values()].filter(v => !v.aboard && !v.ug && !v.inside).sort((p, q) => p.id - q.id).map(v => [v.x, v.y]);
  const to = [...S.buildings.values()].filter(b => b.built && b.type !== 'ruin').sort((p, q) => p.id - q.id).map(b => Vg.door(b));
  // (the machine's own clock: the game's is stopped in the tests)
  const ms = () => Number(process.hrtime.bigint()) / 1e6;
  let pairs = 0, has = 0, ex = 0, got = 0, miss = []; let tEx = 0, tGo = 0;
  for (let k = 0; pairs < 300 && k < from.length * 7 && from.length && to.length; k++) {
    const s = from[(k * 7919) % from.length], g = to[(k * 104729) % to.length];
    if (G.dist(s[0], s[1], g[0], g[1]) < 24 || !W.canWalk(s[0], s[1], g[0], g[1], true)) continue;
    pairs++; if (!truth(s[0], s[1], g[0], g[1], true)) continue; has++;
    let t0 = ms(); if (exact(s[0], s[1], g[0], g[1], true)) ex++; tEx += ms() - t0;
    const fake = { x: s[0], y: s[1], _pfI: -1, _pfT: -1e9, _pfN: 0, path: null };
    t0 = ms(); if (Vg.goto(fake, g[0], g[1], true)) got++; else if (miss.length < 3) miss.push(`${s.map(q => q.toFixed(1))} → ${g.map(q => q.toFixed(1))}`); tGo += ms() - t0;
  }
  ok('l3 todo par longo que tem caminho o Vg.goto acha', pairs >= 100 && got === has, `${pairs} pares longos abertos pelo mapa, ${has} com caminho: a busca exata sozinha acha ${ex} (${tEx.toFixed(0)} ms), o Vg.goto ${got} (${tGo.toFixed(0)} ms)${miss.length ? '; não achou: ' + miss.join(' · ') : ''}`);
}
const nv = fresh(); const e = M.erros(); const mods = Object.keys(e.mod);
ok('verificador', !nv.length, nv.slice(0, 3).join(' · ') || 'limpo');
ok('erros', !mods.length && !e.console.length, `módulos: ${mods.join(', ') || 'nenhum'}; console: ${e.console.slice(0, 2).join(' · ') || 'nada'}`);
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU: todos');
process.exit(fails.length ? 1 : 0);
