// termas-corpo: o corpo do deus vai da rua a cada piscina das termas, de verdade — em Node, sem navegador (a simulação do
// qa/nodemundo.js com os arquivos do corpo depois dela, como o visual/corpo-casa.js: a planta é a do G.Interiors, o andar é o do
// controle do próprio corpo, quadro a quadro como o main.js do jogo). Num mundo novo (o da semente 103), as termas (5 casas) e
// as grandes termas (7 casas) pela mão do deus num lote plano junto da cidade de um povo da terma (T-784, D-183):
//   1. da rua, pela escadaria, ao alto dela e para dentro da palestra: o mundo tem o corpo dentro, no piso do pódio
//   2. sob a colunata e pelo portal, a um cabide do vestiário; dali à beira de cada piscina — de cada cômodo e da palestra —, e à
//      fornalha: o caminho pelas portas dos cômodos (as mãos as abrem), o corpo chega a um passo do lugar, e o lugar na água
//      está livre para as mãos dele (In.freeFor). O lugar da fornalha é do foguista enquanto ele está de posto (D-227: desde
//      antes de abrir até o fogo dado até fechar; um lugar, uma pessoa — D-085): o corpo, que não é o foguista, chega a um
//      passo e não o toma; com o fogo dado até fechar pela mão da prova o foguista sai, e o lugar fica livre para o corpo
//   3. em todo quadro, os pés no chão da planta e o corpo só onde a planta deixa ficar — nunca dentro de uma piscina, de uma
//      coluna, de uma parede
//   4. um save com o corpo lá dentro: carregado, dentro ainda, no mesmo piso
//   5. de volta à rua pela escadaria: o mundo o tem fora
//   e o verificador (S0 a S2) limpo, nenhum erro de módulo nem aviso no console.
//   node qa/visual/termas-corpo.js [termas|grandes]
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js', 'qa/escala-inv.js', 'qa/poder-inv.js', 'qa/termas-grandes-inv.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | termas-corpo ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = process.argv[2] || '';
let S = M.novo({ seed: 103, type: 'continente', size: 128, tribes: 6, temper: 'normal' });
const W = G.W, TL = G.Space.TILE, In = G.Interiors, Sp = G.Space, V = G.Village;
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const IN = G.Avatar.input;
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const st = () => G.Avatar.state();
let oldRule = 0;
const vbad = () => QA.check().filter(q => q.sev <= 2).filter(q => { if (/sem estar dormindo em casa/.test(q.msg) && G.Possess.indoorOK && G.Possess.body() && G.Possess.indoorOK(G.Possess.body())) { oldRule++; return false; } return true; });
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
// (every frame: the body indoors stands only where its plan lets one stand, on the plan's floor — and never anywhere the world's
// ground does not hold it outdoors; corpo-casa's check)
let bad = [], frames = 0;
function check() {
  const v = G.Possess.body(), s = st(); if (!v || !s || s.loco === 'sleep' || s.loco === 'stair' || s.loco === 'seat') return; frames++;
  const ins = Sp.indoor(s.X, s.Z, s.lv, s.inB ? s.inB.id : 0);
  if (ins) { if (s.ground && Math.abs(s.Y - ins.y) > 0.03 && !s.stair) bad.push(`pés a ${(s.Y - ins.y).toFixed(2)} m do chão da planta em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`);
    if (!ins.walk) bad.push(`num lugar que a planta não deixa (${ins.code}) em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`); }
  else if (!W.walkableXY(v.x, v.y) && !G.Possess.afloat(v)) bad.push(`fora, num lugar onde o mundo não anda (${v.x.toFixed(2)},${v.y.toFixed(2)})`);
}
// (the body walked toward a point of the world (metres), as a player holds the stick: until there, or stuck)
function walkTo(X, Z, max, near) {
  const s = st(); let k = 0, still = 0, last = [s.X, s.Z];
  for (; k < (max || 600); k++) {
    const dx = X - s.X, dz = Z - s.Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); check();
    if (Math.hypot(s.X - last[0], s.Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [s.X, s.Z];
  }
  stop(); for (let q = 0; q < 6; q++) { frame(); check(); }
  return { k, d: Math.hypot(X - s.X, Z - s.Z) };
}
// (a path over the plan's storey — cells where the body fits —, from a point to another (metres of the lot), through the doors
// of its rooms as one goes: square through a door's middle, the hands opening it on the way; corpo-casa's pathIn)
function pathIn(b, p, lv, from, to) {
  const doors = p.doors.map((d, id) => { const w = p.walls[d.wall]; if (!w || w.lv !== lv || d.outer) return null; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; const ux = (w.b[0] - w.a[0]) / L, uz = (w.b[1] - w.a[1]) / L;
    return { id, M: [w.a[0] + ux * d.at, w.a[1] + uz * d.at], u: [ux, uz], n: [-uz, ux], half: Math.max(0.1, d.w / 2 - 0.25) }; }).filter(Boolean);
  const doorOf = (x, z) => { for (const d of doors) { const dx = x - d.M[0], dz = z - d.M[1]; if (Math.abs(dx * d.u[0] + dz * d.u[1]) <= d.half && Math.abs(dx * d.n[0] + dz * d.n[1]) <= 0.7) return d; } return null; };
  const fits = (x, z, r) => { const d = doorOf(x, z); if (d) { const q = Sp.indoor(b.x * TL + x, b.y * TL + z, lv, b.id); return !!q && (q.walk || q.door === d.id); }
    for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) { const q = Sp.indoor(b.x * TL + x + dx, b.y * TL + z + dz, lv, b.id); if (!q || !q.walk) return false; } return true; };
  const line = (x0, z0, x1, z1) => { const L = Math.hypot(x1 - x0, z1 - z0); for (let t = 0; t <= L + 1e-9; t += 0.1) { const f = L ? t / L : 0; if (!fits(x0 + (x1 - x0) * f, z0 + (z1 - z0) * f, 0.3)) return false; } return true; };
  if (line(from[0], from[1], to[0], to[1])) return [to.slice()];
  const cells = (cs, r) => { const n = Math.round(p.grid.n * p.grid.cs / cs); const c = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)]; const [sx, sz] = c(from[0], from[1]), [tx, tz] = c(to[0], to[1]);
    const prev = new Map(); const key = (x, z) => z * n + x; const q = [[sx, sz]]; prev.set(key(sx, sz), null);
    for (let i = 0; i < q.length; i++) { const [x, z] = q[i]; if (x === tx && z === tz) break;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Z = z + dz; if (X < 0 || Z < 0 || X >= n || Z >= n || prev.has(key(X, Z))) continue; if (!(X === tx && Z === tz) && !fits((X + 0.5) * cs, (Z + 0.5) * cs, r)) continue; prev.set(key(X, Z), [x, z]); q.push([X, Z]); } }
    if (!prev.has(key(tx, tz))) return null; const out = []; let cur = [tx, tz]; while (cur) { out.unshift([(cur[0] + 0.5) * cs, (cur[1] + 0.5) * cs]); cur = prev.get(key(cur[0], cur[1])); } return out; };
  const out = cells(p.grid.cs, 0.34) || cells(p.grid.cs / 2, 0.26); if (!out) return null;
  const res = [];
  for (let k = 0; k < out.length; k++) {
    const d = doorOf(out[k][0], out[k][1]); if (!d || k === out.length - 1) { res.push(out[k]); continue; }
    const k0 = k; while (k + 1 < out.length - 1 && doorOf(out[k + 1][0], out[k + 1][1]) === d) k++;
    const sd = (P, s0) => ((P[0] - d.M[0]) * d.n[0] + (P[1] - d.M[1]) * d.n[1] >= 0 ? s0 : -s0);
    const a = sd(k0 ? out[k0 - 1] : from, 0.45), e = sd(out[k + 1], 0.45); if (Math.sign(a) === Math.sign(e)) { for (let j = k0; j <= k; j++) res.push(out[j]); continue; }
    const A = [d.M[0] + d.n[0] * a, d.M[1] + d.n[1] * a]; A.door = d.id; res.push(A, d.M.slice(), [d.M[0] + d.n[0] * e, d.M[1] + d.n[1] * e]);
  }
  return res;
}
let followAt = '';
const follow = (b, pts) => { followAt = ''; for (const pt of pts) { const r = walkTo(b.x * TL + pt[0], b.y * TL + pt[1], 240, 0.12);
  const ds = pt.door !== undefined && In.doorState(b, pt.door); if (ds && ds.state !== 'aberta') { G.Possess.apply(w => In.useDoor(b, pt.door, 'abrir', w)); frame(); }
  if (r.d > 0.3) { const s = st(); const q = Sp.indoor(s.X, s.Z, G.Possess.level(), b.id); followAt = `parado em ${(s.X - b.x * TL).toFixed(2)},${(s.Z - b.y * TL).toFixed(2)} (célula ${q ? q.code : '-'}), a ${r.d.toFixed(2)} m de ${pt[0].toFixed(2)},${pt[1].toFixed(2)}; barrado por ${s.block || 'nada'}`; return false; } } return true; };
// (a point straight in from the entrance, k metres past its door — square to the door's wall; before it, k < 0)
const inward = (p, k) => { const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
  if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz < 0) { nx = -nx; nz = -nz; } return [e.x + nx * k, e.z + nz * k]; };
// (where the body's whole rim stands by a place: the place's standing point, or the nearest such point round it)
const fitsAt = (b, x, z) => { const r = 0.34; for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) { const q = Sp.indoor(b.x * TL + x + dx, b.y * TL + z + dz, 0, b.id); if (!q || !q.walk) return false; } return true; };
const nearOf = (b, at) => { if (fitsAt(b, at[0], at[1])) return at; for (let rr = 0.1; rr <= 0.7; rr += 0.05) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const x = at[0] + Math.cos(a) * rr, z = at[1] + Math.sin(a) * rr; if (fitsAt(b, x, z)) return [x, z]; } return at; };
const townsOf = c => [...G.S.settlements.values()].filter(s => G.Fac.get(s.fac) && G.Civ.idOfFac(s.fac) === c).sort((a, b) => V.pop(b.id) - V.pop(a.id) || a.id - b.id);
const sim = fn => { G.inSim++; try { return fn(); } finally { G.inSim--; } };
// (the nearest lot of n with its ring free whose ground the podium covers — 3 m —, as qa/monumental-poder.js)
const flatLot = (set, n, R) => { const N = G.N, T = G.T; const ox = Math.floor(set.cx), oy = Math.floor(set.cy);
  for (let r = 0; r <= R; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
    if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue; const x = ox + dx - Math.floor(n / 2), y = oy + dy - Math.floor(n / 2); let ok2 = true;
    for (let ty = y - 1; ty <= y + n && ok2; ty++) for (let tx = x - 1; tx <= x + n; tx++) { if (tx < 2 || ty < 2 || tx >= N - 2 || ty >= N - 2) { ok2 = false; break; } const i = ty * N + tx;
      if (G.S.occ[i] || G.S.wall[i] || G.S.type[i] < T.SAND || (tx >= x && tx < x + n && ty >= y && ty < y + n && (G.S.road[i] >= 2 || G.S.fire[i] > 0))) { ok2 = false; break; } }
    if (!ok2) continue; let lo = 1e9, hi = -1e9; for (let ty = y; ty <= y + n; ty++) for (let tx = x; tx <= x + n; tx++) { const h = W.hAt(tx, ty); lo = Math.min(lo, h); hi = Math.max(hi, h); }
    if ((hi - lo) * Sp.HM <= 3 + 1e-6) return { x: x + Math.floor(n / 2), y: y + Math.floor(n / 2) };
  }
  return null; };

function caso(c, step, n) {
  const key = step === 'termas' ? 'as termas' : 'as grandes termas'; const set = townsOf(c)[0];
  if (!set) { ok(`há ${key} com planta e alguém que se pode viver`, false, `nenhuma cidade ${c}`); return; }
  // (the lot: the nearest flat one where the way in fits before the street — the first of a few tried)
  let b = null, p = null;
  for (let R = 6; R <= 46 && !b; R += 8) { const at = flatLot(set, n, R); if (!at) continue; const q = sim(() => V.handFound(set, 'banhos', step, { built: true, x: at.x, y: at.y, R: 1 })); if (!q) continue; const pp = Sp.planNow(q); if (pp && pp.ok && Sp.entryFits(q, In.shellOf(q)).ok) { b = q; p = pp; } else sim(() => V.removeBuilding(q)); }
  const v = b ? [...G.S.villagers.values()].filter(o => o.set === set.id && o.age >= 18 && o.age < 55 && !o.sleeping && G.Possess.can(o).ok).sort((a, z) => a.id - z.id)[0] : null;
  if (!b || !v) { ok(`há ${key} com planta e alguém que se pode viver`, false, b ? 'ninguém para viver' : `${set.name}: nenhum lote plano onde a entrada caiba`); return; }
  const out0 = inward(p, -3.4); if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
  G.Vg.endTask(v); v.inside = 0; v.x = (b.x * TL + out0[0]) / TL; v.y = (b.y * TL + out0[1]) / TL; v.path = null;
  const took = G.Possess.take(v).ok; G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  ok(`há ${key} com planta e alguém que se pode viver`, took && W.walkableXY(v.x, v.y), `${set.name} (${c}): banhos#${b.id} de ${b.w} casas (${b.esc}, ${p.fam}, o lado ${b.ip.s}), ${v.name} na rua diante da escadaria`);
  if (!took) return;
  const here = () => [st().X - b.x * TL, st().Z - b.y * TL]; const t = In.table(b); const R = In.riskOf(G.Forma.of('banhos', c, n));
  // ------------------------------ 1. up the flight, in
  bad = []; frames = 0; const top = inward(p, -0.3); walkTo(b.x * TL + top[0], b.y * TL + top[1], 400, 0.1); const in1 = inward(p, 1.2); const r1 = walkTo(b.x * TL + in1[0], b.y * TL + in1[1], 300); frame(); frame();
  const y1 = st().Y - Sp.plinth(b).y0;
  ok(`1. ${key}: da rua pela escadaria ao alto dela e para dentro da palestra — o mundo tem o corpo dentro, no piso do pódio`, v.inside === b.id && G.Possess.level() === 0 && r1.d < 0.3 && Math.abs(y1 - R.Hp) < 0.06 && !bad.length, `dentro de ${v.inside}; piso ${G.Possess.level()}; a ${r1.d.toFixed(2)} m do ponto; os pés a ${y1.toFixed(2)} m (o pódio: ${R.Hp})${bad.length ? '; ' + bad.slice(0, 2).join(' · ') : ''}`);
  // ------------------------------ 2. to a peg, to every pool, to the furnace
  const goals = []; const first = use => t.spots.find(e => e.use === use && e.ok && e.din < Infinity);
  { const e = first('despir'); if (e) goals.push(['um cabide', e]); }
  const pools = [...new Set((t.byUse.get('banhar') || []).map(e => e.it.id))]; for (const id of pools) { const e = (t.byUse.get('banhar') || []).find(q => q.it.id === id && q.din < Infinity); const m = e && p.rooms.find(q => q.id === e.it.room); if (e) goals.push([`a piscina d${m && m.fn === 'palestra' ? 'a palestra' : 'o cômodo ' + (m ? m.fn : '-')}`, e]); }
  { const e = first('alimentar'); if (e) goals.push(['a fornalha', e]); }
  let got = 0, far = 0; const miss = []; let saved = '', post = '';
  for (const [name, e] of goals) {
    let pl = In.freeFor(b, e.it.id, e.q, here()[0], here()[1]);
    // (the furnace's place is the stoker's while he is at his post — from before the doors open until the fire is fed to their
    // closing: D-227 —, and a place has one person (D-085): the body, which is not the stoker, comes within a step of it and
    // does not take it. Then the fire is fed to the closing by the proof's hand: the post is over, the stoker leaves, and the
    // place is free for the body's hands. The body that is the stoker has the place by the errand's own offer — the case of
    // qa/termas-mao.js)
    if (!pl && e.use === 'alimentar') {
      const Te = G.Termas; const who = [...G.S.villagers.values()].find(o => { if (o.inside !== b.id) return false; const q = In.placeOf(o); return !!q && q.item === e.it.id && q.q === e.q; });
      const his = !!who && who.role === 'foguista' && who.job === b.id; const duty = his && Te.onDuty(who);
      const held = In.placeFor(b, e.it.id, e.q, here()[0], here()[1]); const to0 = held ? nearOf(b, held.at || [held.x, held.z]) : null; const pa0 = to0 && pathIn(b, p, 0, here(), to0);
      if (!his || !pa0) { miss.push(`${name}: o lugar tomado ${who ? 'por ' + who.name + ' (' + who.role + '), que não é o foguista destes banhos' : 'por ninguém que o mundo tenha lá'}${pa0 ? '' : '; nenhum caminho até ele'}`); continue; }
      follow(b, pa0); const d0 = Math.hypot(here()[0] - to0[0], here()[1] - to0[1]); const still = !In.freeFor(b, e.it.id, e.q, here()[0], here()[1]);
      // (the fire fed to the closing: the day's own book, by the proof's hand — the doors open first, if they have not yet)
      let w8 = 0; while (!Te.dia(b) && w8++ < 1800) frame();
      // (two logs' worth at the most — what the furnace takes: the day's hours are as long)
      sim(() => { const op = Te.dia(b); if (op && op.data) op.data.calor = Math.max(op.data.calor || 0, Math.min(2 * Te.BURN, (Te.horas(b).fecha - G.S.time) * G.DAY_LEN + 2)); });
      const c0 = G.S.clock; let w9 = 0; while (!(pl = In.freeFor(b, e.it.id, e.q, here()[0], here()[1])) && w9++ < 1800) frame();
      post = `a fornalha era de ${who.name}, o foguista ${duty ? 'de posto' : 'à fornalha'}: o corpo a ${d0.toFixed(2)} m dela, o lugar ${still ? 'não era para ele' : 'DADO AO CORPO COM O FOGUISTA NELE'}; com o fogo dado até fechar, ${pl ? `o foguista saiu em ${(G.S.clock - c0).toFixed(0)} s (de posto: ${Te.onDuty(who) ? 'AINDA' : 'não'}) e o lugar ficou livre` : 'O FOGUISTA NÃO SAIU'}`;
      if (d0 > 1.2 || !still || !pl || Te.onDuty(who)) { miss.push(`${name}: ${post}`); continue; }
    }
    if (!pl) { miss.push(`${name}: o lugar não está livre para o corpo`); continue; }
    const to = nearOf(b, pl.at || [pl.x, pl.z]); const pa = pathIn(b, p, 0, here(), to); if (!pa) { miss.push(`${name}: nenhum caminho até (${to[0].toFixed(1)}, ${to[1].toFixed(1)})`); continue; }
    if (!follow(b, pa)) { miss.push(`${name}: ${followAt}`); continue; }
    const d = Math.hypot(here()[0] - to[0], here()[1] - to[1]); far = Math.max(far, d); if (d > 0.35 || v.inside !== b.id) { miss.push(`${name}: a ${d.toFixed(2)} m, dentro de ${v.inside}`); continue; } got++;
    // ------------------------------ 4. a save with the body in there, at the first pool
    if (!saved && e.use === 'banhar') { const lv0 = G.Possess.level(); M.salvarCarregar(); S = G.S; const w = G.Possess.body(); if (w) { G.Avatar.attach(w, 0); for (let k = 0; k < 6; k++) frame(); }
      b = G.S.buildings.get(b.id); p = Sp.planNow(b); const still = !!w && w.inside === b.id && G.Possess.level() === lv0; saved = still ? 'dentro ainda, no mesmo piso' : `FORA (dentro de ${w ? w.inside : '-'}, piso ${G.Possess.level()})`; }
  }
  ok(`2. ${key}: sob a colunata e pelo portal a um cabide, à beira de cada piscina (${pools.length}) e à fornalha, pelas portas dos cômodos — o corpo chega a um passo de cada lugar, livre para as mãos dele (a fornalha, quando o foguista deixa o posto: D-227)`, got === goals.length && goals.length === pools.length + 2 && pools.length === R.pools.length, `${got} de ${goals.length} lugares alcançados (o mais longe do ponto: ${far.toFixed(2)} m)${post && !miss.length ? '; ' + post : ''}${miss.length ? '; ' + miss.slice(0, 3).join(' / ') : ''}`);
  ok(`3. ${key}: em todo quadro os pés no chão da planta, o corpo só onde ela deixa ficar`, !bad.length && frames > 300, bad.length ? `${bad.length} quadros fora: ${bad.slice(0, 3).join(' · ')}` : `${frames} quadros, cada um na planta`);
  ok(`4. ${key}: um save com o corpo à beira da piscina — carregado, dentro ainda`, saved === 'dentro ainda, no mesmo piso', saved || 'o corpo não chegou a uma piscina');
  // ------------------------------ 5. out
  { const w = G.Possess.body(); bad = []; const back = inward(p, 1.0); const pa = pathIn(b, p, 0, here(), back); const went = !!pa && follow(b, pa);
    const o1 = inward(p, -0.6); walkTo(b.x * TL + o1[0], b.y * TL + o1[1], 300, 0.08); const o2 = inward(p, -3.4); const r5 = walkTo(b.x * TL + o2[0], b.y * TL + o2[1], 400); frame(); frame();
    ok(`5. ${key}: de volta à rua pela escadaria — o mundo tem o corpo fora`, went && !!w && w.inside === 0 && G.Possess.level() === undefined && r5.d < 0.8 && !bad.length, `até a entrada: ${went ? 'sim' : followAt || 'nenhum caminho'}; dentro ${w ? w.inside : '-'}; piso ${G.Possess.level()}; na rua a ${r5.d.toFixed(2)} m${bad.length ? '; ' + bad[0] : ''}`); }
  ok(`${key}: verificador (S0 a S2) durante tudo isso`, !vbad().length, vtxt(vbad()));
}
if (!ONLY || ONLY === 'termas') caso('romano', 'termas', 5);
if (!ONLY || ONLY === 'grandes') caso('grego', 'grandes', 7);
if (oldRule) console.log(`(a regra antiga do qa.js — o corpo dentro só dormindo em casa — acusou ${oldRule} vezes o corpo num cômodo da planta)`);
const E = M.erros(); ok('sem erros de módulo nem do console', JSON.stringify(E.mod) === '{}' && !E.console.length, `${JSON.stringify(E.mod)} ${E.console.slice(0, 2).join(' · ')}`);
console.log(fails.length ? `TERMAS-CORPO: FALHOU (${fails.length})` : 'TERMAS-CORPO: ok');
process.exit(fails.length ? 1 : 0);
