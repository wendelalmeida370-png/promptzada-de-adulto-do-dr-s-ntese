// world generation matrix: many seeds × types × sizes × climates × relief; checks right after creation and after a short life
const types = ['ilha', 'continente', 'arquipelago', 'mar', 'istmo'];
const climas = ['variado', 'frio', 'temperado', 'tropical', 'arido'];
const relevos = ['plano', 'suave', 'montanhoso', 'alpino', 'aleatorio'];
const sizes = [64, 80, 96, 128, 160, 192];
const out = []; const W = G.W; let k = 0;
const N0 = +(window.__GEN_N || 40); const LIFE = +(window.__GEN_LIFE || 0.15);
const rng = (() => { let a = 12345; return () => ((a = (a * 16807) % 2147483647) - 1) / 2147483646; })();
const pick = l => l[Math.floor(rng() * l.length)];
for (let n = 0; n < N0; n++) {
  const o = { type: types[n % types.length], size: pick(sizes), tribes: 1 + Math.floor(rng() * 6), temper: pick(['pacifico', 'normal', 'belicoso']), clima: pick(climas), relevo: pick(relevos) };
  const t0 = performance.now(); let err = null;
  try { G.Main.newGame(o); G.UI.setSpeed(0); G.Main.mode = 'game'; } catch (e) { err = e.message + ' ' + (e.stack || '').split('\n')[1]; }
  const ms = Math.round(performance.now() - t0);
  if (err) { out.push({ o, err }); continue; }
  const S = G.S; const bad = [];
  const facs = G.Fac.all();
  if (facs.length !== o.tribes) bad.push(`povos ${facs.length}/${o.tribes}`);
  for (const f of facs) {
    const c = G.Fac.capitalOf(f.id); if (!c) { bad.push(`${f.name} sem capital`); continue; }
    if (S.type[W.idx(c.cx, c.cy)] <= G.T.SEA) bad.push(`${f.name}: capital ${c.name} na água (${S.type[W.idx(c.cx, c.cy)]})`);
    if (G.Fac.pop(f.id) < 8) bad.push(`${f.name}: só ${G.Fac.pop(f.id)} pessoas`);
  }
  let wet = 0, stuck = 0; for (const v of S.villagers.values()) { if (!W.inb(v.x, v.y) || S.type[W.idx(v.x, v.y)] <= G.T.SEA) wet++; else if (!W.walkableXY(v.x, v.y)) stuck++; } if (wet) bad.push(`${wet} pessoas na água: ` + [...S.villagers.values()].filter(v => !W.inb(v.x, v.y) || S.type[W.idx(v.x, v.y)] <= G.T.SEA).map(v => { const c = G.Fac.capitalOf(G.Fac.idOfV(v)); const nl = W.nearestLand(v.x, v.y, 6); return `${v.name} ${v.age.toFixed(1)}a ${v.x.toFixed(1)},${v.y.toFixed(1)} t${S.type[W.idx(v.x, v.y)]} carregado=${!!v.carried} dCap=${c ? G.dist(v.x, v.y, c.cx, c.cy).toFixed(1) : '?'} terra=${nl ? G.dist(v.x, v.y, nl[0], nl[1]).toFixed(1) : '-'}`; }).join('; ')); if (stuck) bad.push(`${stuck} pessoas em tile não caminhável`);
  let nanH = 0; for (let i = 0; i < S.H.length; i++) if (!isFinite(S.H[i])) nanH++; for (let i = 0; i < S.wl.length; i++) if (!isFinite(S.wl[i])) nanH++; if (nanH) bad.push(`${nanH} tiles com altura/água NaN`);
  let bIn = 0; for (const b of S.buildings.values()) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) { const i = W.idx(x, y); if (!W.inb(x, y) || S.type[i] <= G.T.SEA) bIn++; } if (bIn) bad.push(`${bIn} tiles de prédio na água/fora`);
  let anW = 0; const anK = {}; for (const a of S.animals.values()) { const d = G.Animals.DEF[a.kind]; const sea = !d || d.cls !== 'land' || d.swims; if (!sea && (!W.inb(a.x, a.y) || S.type[W.idx(a.x, a.y)] <= G.T.SEA)) { anW++; anK[a.kind] = (anK[a.kind] || 0) + 1; } }
  if (anW) bad.push(`${anW} bichos terrestres na água ${JSON.stringify(anK)}`);
  // starts far enough apart
  let minD = 1e9; for (const a of facs) for (const b of facs) if (a.id < b.id) { const ca = G.Fac.capitalOf(a.id), cb = G.Fac.capitalOf(b.id); if (ca && cb) minD = Math.min(minD, G.dist(ca.cx, ca.cy, cb.cx, cb.cy)); }
  const v0 = QA.check().filter(q => q.sev <= 2);
  // a short life
  let lifeErr = null; const t1 = performance.now();
  try { QA.run(LIFE); } catch (e) { lifeErr = e.message + ' ' + (e.stack || '').split('\n')[1]; }
  const lifeMs = Math.round(performance.now() - t1);
  const v1 = lifeErr ? [] : QA.check().filter(q => q.sev <= 2);
  let anW2 = 0; const anK2 = {}; for (const a of S.animals.values()) { const d = G.Animals.DEF[a.kind]; if (d && d.cls === 'land' && !d.swims && W.inb(a.x, a.y) && S.type[W.idx(a.x, a.y)] <= G.T.SEA && !a.dead && !a.held) { anW2++; anK2[a.kind + ':' + (a.state || '')] = (anK2[a.kind + ':' + (a.state || '')] || 0) + 1; } } if (anW2) bad.push(`depois da vida: ${anW2} bichos terrestres na água ${JSON.stringify(anK2)}`);
  out.push({ n, o, ms, lifeMs, facs: facs.length, pop: S.villagers.size, an: S.animals.size, trees: S.trees.size, caves: S.ug ? (S.ug.caves || []).length : 0, minD: minD < 1e9 ? Math.round(minD) : null, bad, v0: v0.map(q => `[${q.sev}] ${q.msg}`).slice(0, 5), v1: v1.map(q => `[${q.sev}] ${q.msg}`).slice(0, 5), lifeErr, err });
}
return out;
