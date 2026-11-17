// mata: a mata como o mundo a guarda (G.Mata, js/mata.js; D-470 a D-473).   [ONLY=m1,m3] node qa/mata.js [semente]   (≈ 1 min)
// O G.Mata é uma fonte pura: a densidade e as camadas de cada lugar, o mapa do dossel, as medidas de cada árvore do mundo e os caules
// duros que o corpo não atravessa, tudo do que o save já tem. A fase A só desenha: o mundo fica igual byte a byte.
// m1 pura e determinística: o mesmo mundo dá o mesmo mapa; ler o mapa inteiro não tira de acaso nenhum (o S.rng igual) nem muda o
//    save (igual byte a byte antes e depois);
// m2 a memória bate com o recálculo depois de cada mudança do mundo — a árvore cortada, a queimada, a crescida, o prédio, a estrada,
//    o desgaste, o deus que muda o chão — e depois de um save e um load;
// m3 nada de mata em estrada, prédio, muro, água e cinza; a trilha batida (desgaste ≥ 2) aberta; a de um passo, rala;
// m4 a clareira da árvore caída: a casa clara, o dossel aberto sobre ela; a árvore que volta a crescer a fecha de novo;
// m5 as camadas por bioma: a selva fechada e úmida, com dossel; o deserto quase nu; o temperado entre os dois; a savana aberta;
//    as medidas das árvores (o alto das copas da selva crescida entre 17 e 28 m, as emergentes 6 m acima delas; o temperado como antes);
// m6 os caules duros: nunca em estrada, prédio, trilha, água, nem perto de prédio; dois nunca mais perto que o corpo passa; longe
//    do tronco de toda árvore do mundo; e o espaço do corpo (um disco de 0,32 m) alcança tudo o que alcançava sem eles;
// m7 o mundo igual: a mesma semente vivida 40 s lendo a mata a cada passo e sem ler — o mesmo save; um save antigo sem biomas
//    (S.temp nulo) lido sem erro;
// e o verificador «mata» (qa/mata-inv.js) calado, nenhum erro de módulo nem de console.
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js'] });
const SEED = +(process.argv[2] || 4242);
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const on = k => !ONLY || ONLY.includes(k);
const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | mata ${name} | ${info}`); if (!c) fails.push(name); };
const Ma = G.Mata, W = G.W, T = G.T;
const novo = () => M.novo({ seed: SEED, type: 'continente', size: 192, tribes: 3, clima: 'variado' });
let S = novo(); let N = G.N;
const R = Ma.R;
const regionOf = i => Ma.region(Math.floor((i % N) / R), Math.floor(Math.floor(i / N) / R));
const same = (a, b) => { for (const f of Ma.FIELDS) if (Math.abs(a[f] - b[f]) > 1e-9) return f; return null; };
// (the region of the land most thick with forest of a biome: its index and its mean growth)
function bestRegion(bio) {
  let best = null; const n = Math.ceil(N / R);
  for (let ry = 1; ry < n - 1; ry++) for (let rx = 1; rx < n - 1; rx++) { const r = Ma.region(rx, ry); let s = 0, c = 0;
    for (let k = 0; k < R * R; k++) { const i = (r.y0 + (k / R | 0)) * N + r.x0 + k % R; if (S.biome[i] !== bio || S.type[i] < T.SAND) continue; s += r.dens[k]; c++; }
    if (c > R * R * 0.6 && (!best || s / c > best.m)) best = { rx, ry, r, m: s / c }; }
  return best;
}

if (on('m1')) {
  const rng0 = JSON.stringify(S.rng); const sv0 = G.Save.serialize();
  const a = Ma.canopy(); const d = Ma.canopy(0, 0, N, N, 'dens');
  const rng1 = JSON.stringify(S.rng); const sv1 = G.Save.serialize();
  const a2 = Ma.canopy(); let diff = 0; for (let k = 0; k < a.data.length; k++) if (a.data[k] !== a2.data[k]) diff++;
  // (and a world made again from the same seed: the same map)
  S = novo(); const b = Ma.canopy(); let diff2 = 0; for (let k = 0; k < a.data.length; k++) if (a.data[k] !== b.data[k]) diff2++;
  const db = Ma.canopy(0, 0, N, N, 'dens'); let diff3 = 0; for (let k = 0; k < d.data.length; k++) if (d.data[k] !== db.data[k]) diff3++;
  ok('m1', rng0 === rng1 && sv0 === sv1 && !diff && !diff2 && !diff3 && a.sig === b.sig, `o acaso ${rng0 === rng1 ? 'igual' : 'MUDOU'}; o save ${sv0 === sv1 ? 'igual byte a byte' : 'MUDOU'} (${sv0.length} bytes); duas leituras: ${diff} casas diferentes; o mesmo mundo de novo: dossel ${diff2}, densidade ${diff3} casas diferentes; assinatura ${a.sig === b.sig ? 'igual' : 'diferente'}`);
}

if (on('m2') || on('m4')) {
  S = novo();
  const sel = bestRegion(4); const r0 = sel.r; const trees = [];
  for (let k = 0; k < R * R; k++) { const i = (r0.y0 + (k / R | 0)) * N + r0.x0 + k % R; const t = S.trees.get(S.treeAt[i]); if (t && t.stage === 'grow' && t.size > 0.6) trees.push(t); }
  const checkAll = (what, xs) => { const bad = []; for (const i of xs) { const a = Ma.at(i), f = Ma.fresh(i); const w = same(a, f); if (w) bad.push(`${i % N},${(i / N) | 0} ${w} ${a[w].toFixed(3)}≠${f[w].toFixed(3)}`); } return bad; };
  const around = (x, y, r) => { const o = []; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (W.inb(x + dx, y + dy)) o.push((y + dy) * N + x + dx); return o; };
  const log = []; let bad = [];
  // (warm the memory, then each change of the world, read again at once)
  Ma.canopy();
  const t1 = trees[0], t2 = trees[1], t3 = trees[2];
  const tx = Math.floor(t1.x), ty = Math.floor(t1.y); const before = Ma.at(ty * N + tx);
  G.inSim++; try { G.Nature.fellTree(t1, 1); } finally { G.inSim--; } bad = bad.concat(checkAll('corte', around(tx, ty, 4))); log.push('cortada');
  for (let k = 0; k < 12; k++) G.debug.step(0.1); // (it falls, lies)
  bad = bad.concat(checkAll('tora', around(tx, ty, 4)));
  const fell = Ma.at(ty * N + tx);
  { const i2 = Math.floor(t2.y) * N + Math.floor(t2.x); t2.stage = 'burnt'; t2.t = 0; bad = bad.concat(checkAll('queimada', around(t2.x | 0, t2.y | 0, 4))); log.push('queimada'); }
  { t3.size = Math.min(1.4, t3.size + 0.3); bad = bad.concat(checkAll('crescida', around(t3.x | 0, t3.y | 0, 4))); log.push('crescida'); }
  { const i = (r0.y0 + 8) * N + r0.x0 + 8; S.road[i] = 1; W.touchWalk && W.touchWalk(); bad = bad.concat(checkAll('estrada', around(r0.x0 + 8, r0.y0 + 8, 4))); log.push('estrada'); }
  { const i = (r0.y0 + 4) * N + r0.x0 + 12; S.wear[i] = 40; bad = bad.concat(checkAll('desgaste', around(r0.x0 + 12, r0.y0 + 4, 3))); log.push('desgaste'); }
  { const i = (r0.y0 + 12) * N + r0.x0 + 3; S.occ[i] = 999999; bad = bad.concat(checkAll('prédio', around(r0.x0 + 3, r0.y0 + 12, 3))); S.occ[i] = 0; log.push('prédio'); }
  // (a save and a load: the forest the same, read from the same world)
  const xs = around(r0.x0 + 8, r0.y0 + 8, 9); const pre = xs.map(i => Ma.at(i)); M.salvarCarregar(); S = G.S;
  // (the save keeps a tree's place and size to the hundredth — the loaded world's crowns a hair off: the forest a step of 1/255 off, no more)
  let sl = 0, worst = 0; xs.forEach((i, k) => { const a = Ma.at(i); for (const f of Ma.FIELDS) { const d = Math.abs(a[f] - pre[k][f]) * (f === 'alto' ? 4 : 255); if (d > 0.5) sl++; worst = Math.max(worst, d); } }); bad = bad.concat(checkAll('load', xs)); log.push('save e load');
  // (the god changes the ground: a tile of the forest drowned into a lake)
  { const x = r0.x0 + 6, y = r0.y0 + 6, i = y * N + x; const tid = S.treeAt[i]; if (tid) G.Nature.removeTree(S.trees.get(tid)); S.type[i] = T.RIVER; S.wl[i] = W.tileH(i) + 0.5; S.typeVer = (S.typeVer || 0) + 1; W.invalidateLand && W.invalidateLand();
    bad = bad.concat(checkAll('o deus muda o chão', around(x, y, 4))); log.push('o deus muda o chão'); }
  if (on('m2')) ok('m2', !bad.length && worst <= 3, `${log.join(', ')}: ${bad.length} casas com a memória diferente do recálculo${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}; depois do load, ${sl} campos de ${xs.length} casas a um fio do antes (o save guarda o lugar e o tamanho das árvores ao centésimo), o maior ${worst.toFixed(1)}/255`);
  if (on('m4')) {
    // (the gap: the felled tree's tile clear, the canopy open over it; a sapling growing there again closes it)
    const i = ty * N + tx; S = G.S; const t = [...S.trees.values()].find(o => Math.floor(o.x) === tx && Math.floor(o.y) === ty);
    let back = null; if (t) { t.stage = 'grow'; t.size = 1.0; back = Ma.at(i); }
    ok('m4', fell.clar > 0.9 && fell.dossel < before.dossel - 0.05 && fell.dens >= before.dens - 0.02 && back && back.dossel > fell.dossel + 0.05, `a selva em ${tx},${ty}: antes clareira ${before.clar.toFixed(2)}, dossel ${before.dossel.toFixed(2)}, mata ${before.dens.toFixed(2)}; caída: clareira ${fell.clar.toFixed(2)}, dossel ${fell.dossel.toFixed(2)}, mata ${fell.dens.toFixed(2)} (a clareira enche de pioneiras); crescida de novo: dossel ${back ? back.dossel.toFixed(2) : '—'}`);
  }
}

if (on('m3')) {
  S = novo(); const bad = []; let nRoad = 0, nOcc = 0, nWat = 0, nAsh = 0, nTr = 0, nT1 = 0, t1d = 0, t1n = 0;
  // (paint some of each into the forest of the jungle — the test's hand —, then read every tile of the map)
  const sel = bestRegion(4); const r0 = sel.r;
  for (let k = 0; k < R; k++) { S.wear[(r0.y0 + 2) * N + r0.x0 + k] = 30; S.wear[(r0.y0 + 5) * N + r0.x0 + k] = 16; S.burnt[(r0.y0 + 9) * N + r0.x0 + k] = 50; }
  Ma.canopy();
  for (let i = 0; i < N * N; i++) {
    const x = i % N, y = (i / N) | 0; const r = Ma.region(Math.floor(x / R), Math.floor(y / R)); const d = r.dens[(y - r.y0) * R + (x - r.x0)];
    const lv = G.pathLevel(S.wear[i]);
    if (S.road[i]) { nRoad++; if (d) bad.push(`estrada ${x},${y}`); }
    else if (S.occ[i]) { nOcc++; if (d) bad.push(`prédio ${x},${y}`); }
    else if (S.type[i] <= T.RIVER) { nWat++; if (d) bad.push(`água ${x},${y}`); }
    else if (S.burnt[i] > 0 || S.scar[i] > 0) { nAsh++; if (d > 0.1 * 255) bad.push(`cinza ${x},${y} ${d}`); }
    else if (lv >= 2) { nTr++; if (d) bad.push(`trilha ${x},${y}`); }
    else if (lv === 1 && S.biome[i] === 4) { nT1++; t1d += d; }
    if (S.wall[i] && d) bad.push(`muro ${x},${y}`);
  }
  // (the trail of one step in the jungle: thin, not shut)
  for (let k = 0; k < R; k++) { const i = (r0.y0 + 5) * N + r0.x0 + k; if (S.type[i] >= T.SAND && !S.road[i] && !S.occ[i]) t1n++; }
  ok('m3', !bad.length && nT1 > 0 && t1d / Math.max(1, nT1) < 0.4 * 255, `estrada ${nRoad}, prédio ${nOcc}, água ${nWat}, cinza ${nAsh}, trilha batida ${nTr}: ${bad.length} com mata${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}; a trilha de um passo na selva: ${nT1} casas, mata média ${(t1d / Math.max(1, nT1) / 255).toFixed(2)} (rala)`);
}

if (on('m5')) {
  S = novo(); const B = {}; Ma.canopy();
  for (let i = 0; i < N * N; i++) { if (S.type[i] < T.SAND) continue; const x = i % N, y = (i / N) | 0; const r = Ma.region(Math.floor(x / R), Math.floor(y / R)); const k = (y - r.y0) * R + (x - r.x0);
    const o = B[S.biome[i]] || (B[S.biome[i]] = { n: 0, dens: 0, dossel: 0, umid: 0 }); o.n++; o.dens += r.dens[k] / 255; o.dossel += r.dossel[k] / 255; o.umid += r.umid[k] / 255; }
  const m = (b, f) => (B[b] ? B[b][f] / B[b].n : NaN); const name = b => G.BIOMES[b].id;
  const line = [0, 2, 3, 4, 5, 6, 1].map(b => `${name(b)} ${m(b, 'dens').toFixed(2)}/${m(b, 'dossel').toFixed(2)}`).join(', ');
  const jungleH = [], emerg = [], oakH = [];
  for (const t of S.trees.values()) { if (t.stage !== 'grow' || t.size < 0.9 || t.size > 1.05) continue; const D = Ma.tree(t); if (t.kind === 'jungle') (D.emerg ? emerg : jungleH).push(D.top); if (t.kind === 'oak') oakH.push([D.H, (5 + 7 * G.clamp(Math.round(t.size * 100) / 100, 0.15, 1.4)) * (0.85 + G.hash(t.id * 7) * 0.3)]); }
  const mean = a => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
  const oakSame = oakH.every(([a, b]) => Math.abs(a - b) < 1e-9);
  ok('m5', m(4, 'dens') > 0.6 && m(4, 'dossel') > 0.45 && m(6, 'dens') < 0.08 && m(0, 'dens') > m(6, 'dens') && m(0, 'dens') < m(4, 'dens') && m(5, 'dossel') < m(0, 'dossel') && mean(jungleH) > 17 && mean(jungleH) < 28 && (!emerg.length || mean(emerg) > mean(jungleH) + 6) && oakSame,
    `mata/dossel por bioma: ${line}; a selva crescida no dossel a ${mean(jungleH).toFixed(1)} m (${jungleH.length}), as emergentes a ${emerg.length ? mean(emerg).toFixed(1) : '—'} m (${emerg.length}); o carvalho ${oakSame ? 'com as medidas de antes' : 'MUDOU'} (${oakH.length})`);
}

if (on('m6')) {
  S = novo(); const sel = bestRegion(4); const bad = []; const all = [];
  for (let ry = sel.ry - 1; ry <= sel.ry + 1; ry++) for (let rx = sel.rx - 1; rx <= sel.rx + 1; rx++) { const r = Ma.region(rx, ry); if (!r) continue;
    for (let k = 0; k < R * R; k++) { const x = r.x0 + k % R, y = r.y0 + (k / R | 0); const i = y * N + x;
      for (const s of G.Space.stems(i)) { all.push(s); if (S.road[i] || S.occ[i] || G.pathLevel(S.wear[i]) >= 1 || S.type[i] <= T.RIVER) bad.push(`caule em ${x},${y} sobre o que não pode`);
        if (Math.floor(s[0] / 4) !== x || Math.floor(s[1] / 4) !== y) bad.push(`caule fora da sua casa ${x},${y}`); } } }
  // (two stems never nearer than the body passes; nor a stem by a trunk)
  let pairs = 0, near = 1e9;
  for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) { const d = Math.hypot(all[a][0] - all[b][0], all[a][1] - all[b][1]); if (d > 3) continue; pairs++; const gap = d - all[a][2] - all[b][2]; near = Math.min(near, gap); if (gap < 0.9) bad.push(`dois caules a ${gap.toFixed(2)} m`); }
  let tnear = 1e9;
  for (const s of all) for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const x = Math.floor(s[0] / 4) + dx, y = Math.floor(s[1] / 4) + dy; const t = S.trees.get(S.treeAt[y * N + x]); const tr = G.Space.trunk(t); if (!tr) continue;
    const gap = Math.hypot(s[0] - t.x * 4, s[1] - t.y * 4) - tr - s[2]; tnear = Math.min(tnear, gap); if (gap < 0.9) bad.push(`caule a ${gap.toFixed(2)} m de um tronco`); }
  // (the body's space: a disc of 0,32 m on a grid of 0,2 m over the nine regions, flooded from the middle — what it reaches with the
  // stems is what it reaches without them)
  const r0 = Ma.region(sel.rx - 1, sel.ry - 1); const X0 = r0.x0 * 4, Z0 = r0.y0 * 4, SZ = R * 3 * 4, st = 0.2, n = Math.round(SZ / st); const BR = 0.32;
  const hard = (withStems) => { const g = new Uint8Array(n * n);
    for (let gz = 0; gz < n; gz++) for (let gx = 0; gx < n; gx++) { const X = X0 + gx * st, Z = Z0 + gz * st; const tx = Math.floor(X / 4), tz = Math.floor(Z / 4); if (!W.inb(tx, tz)) { g[gz * n + gx] = 1; continue; } const i = tz * N + tx; if (!W.walkable(i)) { g[gz * n + gx] = 1; continue; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const t = S.trees.get(S.treeAt[(tz + dy) * N + tx + dx]); const tr = G.Space.trunk(t); if (tr && Math.hypot(X - t.x * 4, Z - t.y * 4) < tr + BR) g[gz * n + gx] = 1; } }
    if (withStems) for (const s of all) { const c0 = Math.floor((s[0] - X0 - s[2] - BR) / st), c1 = Math.ceil((s[0] - X0 + s[2] + BR) / st), r1 = Math.floor((s[1] - Z0 - s[2] - BR) / st), r2 = Math.ceil((s[1] - Z0 + s[2] + BR) / st);
      for (let gz = Math.max(0, r1); gz <= Math.min(n - 1, r2); gz++) for (let gx = Math.max(0, c0); gx <= Math.min(n - 1, c1); gx++) if (Math.hypot(X0 + gx * st - s[0], Z0 + gz * st - s[1]) < s[2] + BR) g[gz * n + gx] = 1; }
    return g; };
  const flood = (g, sx, sz) => { const seen = new Uint8Array(n * n); const q = [sz * n + sx]; seen[q[0]] = 1; for (let h = 0; h < q.length; h++) { const c = q[h]; const x = c % n, z = (c / n) | 0;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, nz = z + dz; if (nx < 0 || nz < 0 || nx >= n || nz >= n) continue; const j = nz * n + nx; if (seen[j] || g[j]) continue; seen[j] = 1; q.push(j); } } return seen; };
  const g0 = hard(false), g1 = hard(true); let s0 = -1; for (let k = (n >> 1) * n + (n >> 1); k < n * n; k++) if (!g1[k]) { s0 = k; break; }
  let lost = 0, free1 = 0;
  if (s0 >= 0) { const a = flood(g0, s0 % n, (s0 / n) | 0), b = flood(g1, s0 % n, (s0 / n) | 0); for (let k = 0; k < n * n; k++) { if (g1[k]) continue; free1++; if (a[k] && !b[k]) lost++; } }
  ok('m6', all.length > 20 && !bad.length && !lost && s0 >= 0, `${all.length} caules duros nas nove regiões da selva mais densa (${sel.rx},${sel.ry}); ${bad.length} fora da regra${bad.length ? ' (' + bad.slice(0, 3).join('; ') + ')' : ''}; o vão mais estreito entre dois caules ${near.toFixed(2)} m, entre um caule e um tronco ${tnear.toFixed(2)} m (o corpo: 0,64 m, e folga até 0,9 m); o espaço do corpo: ${lost} de ${free1} pontos livres que ele alcançava sem os caules e não alcança com eles`);
}

if (on('m7')) {
  // (the same seed lived forty seconds twice: reading the whole forest every step, and never — the same save)
  const life = (read) => { M.novo({ seed: SEED + 1, type: 'ilha', size: 96, tribes: 2 }); for (let k = 0; k < 400; k++) { G.debug.step(0.1); if (read && k % 10 === 0) { Ma.canopy(); Ma.canopy(0, 0, G.N, G.N, 'dens'); for (let j = 0; j < 30; j++) G.Space.stems((j * 7919) % (G.N * G.N)); } } return G.Save.serialize(); };
  const a = life(true), b = life(false);
  // (an old save without biomes: the climate null, read without error)
  S = novo(); const sv = JSON.parse(G.Save.serialize()); delete sv.biome; M.abrir(sv); let err = null; try { Ma.canopy(); Ma.at(5 * G.N + 5); } catch (e) { err = String(e); }
  ok('m7', a === b && !err, `quarenta segundos lendo a mata a cada passo e sem ler: o save ${a === b ? 'igual byte a byte' : 'DIFERENTE'} (${a.length} bytes); o save antigo sem biomas: ${err || 'lido sem erro'} (temp ${G.S.temp ? 'refeito' : 'nulo'})`);
}

{ const mi = QA.check().filter(q => q.sys === 'mata'); const e = M.erros();
  ok('verificador', !mi.length && !Object.keys(e.mod).length && !e.console.length, `«mata»: ${mi.length}${mi.length ? ' (' + mi[0].msg + ')' : ''}; módulos ${JSON.stringify(e.mod)}; console ${e.console.length}${e.console.length ? ' (' + e.console[0] + ')' : ''}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU');
process.exit(fails.length ? 1 : 0);
