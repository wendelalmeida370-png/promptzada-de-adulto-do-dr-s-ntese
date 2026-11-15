// a world for the report's pictures: the metropole with the grand libraries standing (the save of qa/saber.js b7) and the
// thermae and the great thermae founded by the god's hand — node mundo-fotos.js <saber-mundo.json> <out.json>  (from qa/)
const fs = require('fs'); const M = require(process.cwd() + '/nodemundo.js'); const G = M.load({ qa: true });
M.pronto('metropole'); G.Save.apply(JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))); G.Main.mode = 'game';
const S = G.S, V = G.Village, Es = G.Escala, In = G.Interiors, Sp = G.Space; const sim = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const flatLot = (set, n, R) => { const S = G.S, W = G.W, N = G.N, T = G.T; const ox = Math.floor(set.cx), oy = Math.floor(set.cy);
  for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - Math.floor(n / 2), y = oy + dy - Math.floor(n / 2); let ok2 = true;
    for (let ty = y - 1; ty <= y + n && ok2; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) { ok2 = false; break; } const i = ty * N + tx;
      if (S.occ[i] || S.wall[i] || S.type[i] < T.SAND || (tx >= x && tx < x + n && ty >= y && ty < y + n && (S.road[i] >= 2 || S.fire[i] > 0))) { ok2 = false; break; } }
    if (!ok2) continue; let lo = 1e9, hi = -1e9; for (let ty = y; ty <= y + n; ty++) for (let tx = x; tx <= x + n; tx++) { const h = W.hAt(tx, ty); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    if ((hi - lo) * Sp.HM <= 3 + 1e-6) return { x: x + Math.floor(n / 2), y: y + Math.floor(n / 2) };
  }
  return null; };
// (the thermae of the god's hand by a town: where, the plan, the way in, the game's report — on the nearest flat lot when there
// is one within R)

const townsOf = c => [...S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id);
const out = [];
for (const [c, step] of [['romano', 'grandes'], ['grego', 'grandes'], ['romano', 'termas'], ['grego', 'termas']]) { const set = townsOf(c)[step === 'grandes' ? 0 : 1] || townsOf(c)[0]; if (!set) { out.push(`${c}/${step}: sem cidade`); continue; }
  const n = Es.steps('banhos').find(s => s.id === step).n; const at = flatLot(set, n, 50); const o = at ? { x: at.x, y: at.y, R: 1 } : { R: 60 };
  const b = sim(() => V.handFound(set, 'banhos', step, Object.assign({ built: true }, o))); out.push(`${c}/${step} em ${set.name}: ${b ? `#${b.id} ${b.w}x${b.h} em ${b.x},${b.y} ${at ? 'plano' : 'ladeira'}` : 'NADA'}`); }
M.viver(20);
for (const b of S.buildings.values()) if ((b.type === 'biblioteca' && b.w === 4) || (b.type === 'banhos' && b.w > 2)) out.push(`${b.type}#${b.id} ${b.esc} ${b.w}x${b.h} em ${S.settlements.get(b.set).name} (${G.Civ.idOfFac(S.settlements.get(b.set).fac)}) ${b.built ? 'pronto' : 'obra'} planta ${In.plan(b) && In.plan(b).ok ? 'ok' : 'NÃO'}`);
fs.writeFileSync(process.argv[3], G.Save.serialize()); console.log(out.join('\n')); console.log('violações S0-S2:', (global.QA || { check: () => [] }).check().filter(q => q.sev <= 2).length, 'erros', JSON.stringify(M.erros()).slice(0, 200));
