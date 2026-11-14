// cais: the quay as the 3D draws it — its deck out over the water, never into the ground (L-188) —, in Node, without a browser
// (the world of qa/nodemundo.js with the 3D's own files after it, qa/visual/tres-node.js):
//   node qa/visual/cais.js [mundo]       (default: the ready world «metropole»)
// The proofs:
//   1. every quay of the world: Build3D.check finds no lying surface of it cut by the ground
//   2. a quay still building by water that is not to its south — the world gives it no side of the water yet (b.wd), and the
//      drawing laid its planks to the south, over the land —: its deck out over the water, the side reckoned by the drawing
//      alone and not written in the world
//   3. a quay whose water is only at a corner, none along a side: no deck over the land, with no side of the water and with the
//      one the world gives it then (Naval.dockInfo's, the first side)
//   4. the god raises a rock beside the planks of a quay, and one before their end: the deck narrows by it and stops short of the
//      other, never into them — still out over the water
//   and no module error
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | cais ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
M.pronto(world);
const S = G.S, W = G.W, B3 = G.Build3D, Sp = G.Space, N = G.N, TL = Sp.TILE, HM = Sp.HM;
const god = f => { G.inSim++; const r = f(); G.inSim--; return r; };
const cutOf = b => (B3.check([b]) || []).filter(e => /cortada pelo chão/.test(e));
const sea = G.SEA * HM + 0.5, top = sea + 0.3; // (the deck's top, as the drawing lays it)
// (the water a quay looks for — Naval's rule —, and how much of it lies along each side of a 2×2 lot)
const water = i => S.type[i] <= G.T.SEA && !(S.dry && S.dry[i]);
const sides = (x, y) => { const n = {}; for (const [k, dx, dy] of [['E', 1, 0], ['W', -1, 0], ['S', 0, 1], ['N', 0, -1]]) { let c = 0; for (let j = 0; j < 2; j++) { const tx = dx > 0 ? x + 2 : dx < 0 ? x - 1 : x + j, ty = dy > 0 ? y + 2 : dy < 0 ? y - 1 : y + j; if (W.inb(tx, ty) && water(W.idx(tx, ty))) c++; } n[k] = c; } return n; };
const land2 = (x, y) => { for (let ty = y; ty < y + 2; ty++) for (let tx = x; tx < x + 2; tx++) { if (!W.inb(tx, ty)) return false; const i = W.idx(tx, ty); if (S.type[i] < G.T.SAND || S.occ[i] || S.objAt[i] || S.wall[i]) return false; } return true; };
const townBy = (x, y) => [...S.settlements.values()].sort((a, c) => G.dist(a.cx, a.cy, x, y) - G.dist(c.cx, c.cy, x, y) || a.id - c.id)[0];
// (how far the drawing reaches out of the lot toward the water: metres past the side of the lot)
const reach = (b, wd) => { const B = B3.bounds(b); if (!B) return 0; return wd[0] > 0 ? B.hi[0] - (b.x + b.w) * TL : wd[0] < 0 ? b.x * TL - B.lo[0] : wd[1] > 0 ? B.hi[2] - (b.y + b.h) * TL : b.y * TL - B.lo[2]; };
const docks = [...S.buildings.values()].filter(b => b.type === 'doca').sort((a, c) => a.id - c.id);

// ------------------------------ 1. every quay of the world ------------------------------
{ const bad = []; for (const b of docks) for (const e of cutOf(b)) bad.push(e);
  ok('1. cada cais do mundo: nenhuma superfície deitada dele cortada pelo chão', docks.length > 0 && !bad.length, `${docks.length} cais${bad.length ? ': ' + bad.slice(0, 4).join(' · ') : ''}`); }

// ------------------------------ 2. a quay still building, its water not to the south ------------------------------
{ let site = null;
  for (let y = 3; y < N - 4 && !site; y++) for (let x = 3; x < N - 4; x++) { if (!land2(x, y)) continue; const n = sides(x, y); if (n.S || !(n.E || n.W || n.N)) continue;
    // (the land to the south stands over the deck: the planks laid that way went into it)
    if (Math.max(Sp.drawnAt(x + 0.5, y + 2.6), Sp.drawnAt(x + 1.5, y + 2.6)) <= top + 0.1) continue; site = [x, y]; break; }
  let nb = null, cut = [], wd0 = 'x', far = 0, side = null;
  if (site) { const t = townBy(site[0] + 1, site[1] + 1); nb = god(() => G.Village.addBuilding('doca', site[0], site[1], t.id, false));
    // (the side with most water along it, the first of a tie in Naval's order: where the planks go)
    if (nb) { const n = sides(site[0], site[1]); let bw = 0; for (const [k, d] of [['E', [1, 0]], ['W', [-1, 0]], ['S', [0, 1]], ['N', [0, -1]]]) if (n[k] > bw) { bw = n[k]; side = d; }
      cut = cutOf(nb); wd0 = nb.wd; far = reach(nb, side); god(() => G.Village.removeBuilding(nb)); } }
  ok('2. um cais em obra junto à água que não fica ao sul: o deque sobre a água, o lado achado pelo desenho e não escrito no mundo', !!nb && !cut.length && wd0 === undefined && far > 3,
    nb ? `em ${site.join(',')} (água ${JSON.stringify(sides(site[0], site[1]))}): ${cut.length ? cut.join(' · ') : 'nada cortado'}; o deque vai ${far.toFixed(1)} m sobre a água; b.wd ${wd0 === undefined ? 'não escrito' : JSON.stringify(wd0)}` : 'nenhum lugar assim neste mundo');
}

// ------------------------------ 3. a quay with water only at a corner ------------------------------
{ let site = null;
  for (let y = 3; y < N - 4 && !site; y++) for (let x = 3; x < N - 4; x++) { if (!land2(x, y)) continue; const n = sides(x, y); if (n.E || n.W || n.S || n.N) continue;
    if (![[x - 1, y - 1], [x + 2, y - 1], [x - 1, y + 2], [x + 2, y + 2]].some(([tx, ty]) => W.inb(tx, ty) && water(W.idx(tx, ty)))) continue;
    // (the land to the south and to the east stands over the deck: the planks laid either way went into it)
    if (Sp.drawnAt(x + 1, y + 2.6) <= top + 0.1 || Sp.drawnAt(x + 2.6, y + 1) <= top + 0.1) continue; site = [x, y]; break; }
  let nb = null, cut0 = [], cut1 = [], wd1 = null;
  if (site) { const t = townBy(site[0] + 1, site[1] + 1); nb = god(() => G.Village.addBuilding('doca', site[0], site[1], t.id, true));
    if (nb) { cut0 = cutOf(nb); god(() => G.Naval.dockInfo(nb)); wd1 = nb.wd; cut1 = cutOf(nb); god(() => G.Village.removeBuilding(nb)); } }
  ok('3. um cais com água só num canto: nenhum deque sobre a terra, sem lado da água e com o que o mundo lhe dá', !!nb && !cut0.length && !cut1.length,
    nb ? `em ${site.join(',')}: sem lado ${cut0.length ? cut0.join(' · ') : 'nada cortado'}; com o lado ${JSON.stringify(wd1)} do mundo ${cut1.length ? cut1.join(' · ') : 'nada cortado'}` : 'nenhum lugar assim neste mundo');
}

// ------------------------------ 4. a rock beside the planks, and one before their end ------------------------------
{ const V = N + 1; const H = S.H;
  const b = docks.find(d => d.built && d.wd && d.w === 2 && d.h === 2 && !cutOf(d).length && reach(d, d.wd) > 6);
  const rows = []; let good = !!b;
  if (b) { const wd = b.wd, sd = [wd[1], wd[0]]; const base = [b.x + b.w / 2 + wd[0] * b.w / 2, b.y + b.h / 2 + wd[1] * b.h / 2];
    for (const [nm, out, across] of [['ao lado', 1, 1], ['diante do fim', 2, 0]]) {
      const vx = base[0] + wd[0] * out + sd[0] * across, vy = base[1] + wd[1] * out + sd[1] * across; const k = vy * V + vx; const h0 = H[k];
      god(() => { H[k] = (top + 2) / HM; S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand(); });
      const cut = cutOf(b), far = reach(b, wd);
      god(() => { H[k] = h0; S.typeVer++; W.invalidateLand(); });
      // (beside the planks the deck narrows and goes on; before their end it stops short of the rock — and is still there)
      const want = across ? far > 6 : far > 1.5 && far < out * TL;
      if (cut.length || !want) good = false;
      rows.push(`${nm} (${vx},${vy}): ${cut.length ? cut.join(' · ') : 'nada cortado'}, o deque a ${far.toFixed(1)} m sobre a água`);
    } }
  ok('4. o deus ergue uma pedra ao lado das tábuas de um cais, e outra diante do fim delas: o deque se estreita e para antes, nunca entra nelas', good,
    b ? `doca#${b.id} (${(S.settlements.get(b.set) || {}).name}, a água ${JSON.stringify(b.wd)}, ${reach(b, b.wd).toFixed(1)} m de deque): ${rows.join(' · ')}` : 'nenhum cais inteiro com o lado da água neste mundo');
}

ok('módulos', JSON.stringify(G.modErr) === '{}', JSON.stringify(G.modErr));
console.log(fails.length ? `FALHAS: ${fails.join(' · ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
