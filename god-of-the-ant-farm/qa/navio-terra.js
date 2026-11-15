// navio-terra: node qa/navio-terra.js [semente] — o navio não passa por cima da terra (L-453, L-454). Do caos 13 da regressão
// final (arquipélago): (L-453) uma invasão chegou à praia com um transporte ainda dando a volta numa ilha, a umas 80 casas; o
// desembarque mandava cada transporte em linha reta para a água rasa da praia, e esse atravessou a ilha, ficou parado na areia
// quando a frota voltou e, levado pela frota seguinte, «transporte#3841: navegando (fleet) em terra (3)» dezoito vezes; e os
// soldados dele desciam na praia de onde ele estivesse. (L-454) o deus ergueu terra perto do cais (o «poder raise» do ato 271):
// o reshape refazia o rumo de um navio só quando uma das curvas do rumo caía na terra nova, nunca quando o trecho entre duas
// delas a cortava, e o barco de pesca que voltava passou por cima do morro novo («pesca#675: navegando (back) em terra (3)»).
// Num mundo de ilhas novo (o do mar 11 do mar17.js: dois povos em ilhas diferentes, em guerra), em Node:
//  n1 a invasão chega à praia com o único transporte posto, pela mão da prova, atrás de uma ponta de terra (a reta até a água
//     rasa da praia corta terra; pelo mar há caminho): ele nunca fica em terra, nenhum soldado desce dele longe da praia (a mais
//     de G.Fleets.WADE casas), e ele chega pelo mar e os soldados descem lá
//  n2 o mesmo, com um save carregado no meio do desembarque (o transporte ainda dando a volta): depois de carregar ele segue
//     para a praia, e tudo como no n1
//  n3 o deus ergue terra no meio do rumo de um barco de pesca que volta ao cais (um trecho reto e longo do rumo, o morro no
//     meio dele, longe das duas pontas): o barco nunca fica em terra e chega ao cais pelo mar
//  n4 o mesmo, com um save carregado logo depois do morro
//  n5 o deus abre o mar no meio do rumo de um barco que volta (o mesmo defeito ao lado: o fundo que seca, seapart.js): o barco
//     nunca anda no fundo seco
//  n6 o verificador vê um navio deixado parado em terra (a mão da prova põe um barco do cais na areia mais perto), e para
//     de ver quando ele volta à água (T-344: o transporte do L-453 ficou 37 atos na areia sem ninguém ver)
//  e, em cada caso, o verificador sem nada novo de S0 a S2, sem erro de módulo nem no console. No código de antes falham o n1
//  (em terra 9 passos; os 10 soldados descem a 8 casas da praia), o n2 (o mesmo, e depois do save o transporte fica parado), o
//  n3 (84 passos por cima do morro), o n5 (46 passos no fundo seco) e o n6 (o verificador não via); o n4 guarda o load, que já
//  refazia o rumo de quem volta.
//  Fase «mar» da regressão.
const M = require('./nodemundo.js');
const G = M.load({ qa: true });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | navio-terra ${name} | ${info}`); if (!c) fails.push(name); };
const SEED = +(process.argv[2] || 7);
const W = G.W, T = G.T;
const Nv = () => G.Naval, Fl = () => G.Fleets;
// (the rule of the checker: a ship that moves is on the sea, or on a river)
const onLand = (x, y) => { const t = G.S.type[W.idx(x, y)]; return t > T.SEA && t !== T.RIVER; };
const water = (x, y) => W.inb(x, y) && G.S.type[W.idx(x, y)] <= T.SEA;
// the longest stretch of a straight line that lies on land, in tiles (sampled every 0.05)
function landRun(ax, ay, bx, by) { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / 0.05); let run = 0, best = 0; for (let k = 0; k <= n; k++) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n; if (onLand(x, y)) { run++; if (run > best) best = run; } else run = 0; } return best * 0.05; }
const pathLen = (x, y, p) => { let n = 0, ax = x, ay = y; for (const q of p) { n += Math.hypot(q[0] - ax, q[1] - ay); ax = q[0]; ay = q[1]; } return n; };
const open = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (!water(x + dx, y + dy)) return false; return true; };
let base = new Set();
const fresh = () => QA.check().filter(q => q.sev <= 2 && !base.has(q.sys + '|' + q.msg)).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);

// ------------------------------ the world: two peoples on two islands, at war ------------------------------
function mundo() {
  let S = null;
  for (let k = 0; k < 8; k++) {
    S = M.novo({ seed: SEED + k, type: 'mar', size: 150, tribes: 2, temper: 'pacifico', relevo: 'suave' });
    let g = 0; while (S.day < 1 && g++ < 100000) G.debug.step(0.1);
    G.Know.init();
    const fs = G.Fac.all(); const a = G.Fac.capitalOf(fs[0].id), b = G.Fac.capitalOf(fs[1].id);
    if (a && b && G.Know.at(a.cx, a.cy) !== G.Know.at(b.cx, b.cy)) break;
  }
  const fs = G.Fac.all().slice(0, 2); const docks = [];
  // (the quay where the town can have one, the town's ground widened step by step, as the mar17.js does)
  const dockOf = set => { let site = null; const r0 = set.radius; for (const R of [8, 14, 20, 28, 36]) { set.radius = R; site = G.City.dockSite(set); if (site) break; } set.radius = r0; return site ? G.Village.addBuilding('doca', site[0], site[1], set.id, true) : null; };
  fs.forEach((f, i) => {
    const set = G.Fac.capitalOf(f.id); const want = i ? 50 : 150;
    let k = 0; while (G.Fac.pop(f.id) < want && k++ < 9000) { const a = G.R() * 6.283, r = G.R() * (set.radius || 6); const p = W.nearestLand(set.cx + Math.cos(a) * r, set.cy + Math.sin(a) * r, 5); if (p) G.Vg.create({ set: set.id, x: p[0], y: p[1], age: 17 + G.R() * 38 }); }
    for (const t of ['navegacao', 'bronze', 'arco', 'ferro']) f.tech.known[t] = 1;
    G.Depot.make('f:' + f.id, 'wood', 600, { code: 'navio-terra-w' + i, part: true }); G.Depot.make('f:' + f.id, 'food', want * 8, { code: 'navio-terra-f' + i, part: true });
    docks.push(dockOf(set));
  });
  G.Fac.updateTerritory(); G.Know.init(); G.Politics.meet(fs[0], fs[1], { quiet: true }); G.Politics.declareWar(fs[0], fs[1], 'ambicao');
  return { S: G.S, A: fs[0], B: fs[1], dock: docks[0] };
}

// ------------------------------ n1, n2: the landing with a transport behind a point of land ------------------------------
// (the spot, by rule: open water of the beach's own sea, 12 to 36 tiles from its shallows, from where the straight line to every
// shallow the landing may send a transport to crosses at least 0.3 of a tile of land, and from where the sea leads there;
// the one with the shortest way by sea — then the nearest, then the first — so that it can come in within the landing)
function behind(fl) {
  const N = G.N; const bw = fl.land.water; const c = Nv().compAt(bw[0], bw[1]);
  const sh = []; for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const x = Math.floor(bw[0]) + dx + 0.5, y = Math.floor(bw[1]) + dy + 0.5; if (water(x, y) && G.dist(x, y, bw[0], bw[1]) <= 2.5 && Nv().compAt(x, y) === c) sh.push([x, y]); }
  let best = null;
  for (let i = 0; i < N * N; i++) {
    const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const d = G.dist(x, y, bw[0], bw[1]); if (d < 12 || d > 36) continue;
    if (!open(x, y) || Nv().compAt(x, y) !== c) continue;
    if (!sh.every(q => landRun(x, y, q[0], q[1]) >= 0.3)) continue;
    const p = Nv().seaPath(x, y, bw[0], bw[1]); if (!p) continue;
    const len = pathLen(x, y, p); const k = [len, d, i];
    if (!best || k[0] < best.k[0] - 1e-9 || (Math.abs(k[0] - best.k[0]) < 1e-9 && (k[1] < best.k[1] - 1e-9 || (Math.abs(k[1] - best.k[1]) < 1e-9 && k[2] < best.k[2])))) best = { x, y, k, len, d };
  }
  return best;
}
function landing(withSave) {
  const { A, B, dock } = mundo(); base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const tgt = G.Fac.capitalOf(B.id); const w = G.Wars.warOf(A.id, B.id);
  const tr0 = dock && Nv().spawn('transporte', A, dock);
  const a0 = tr0 && Fl().amphibious(w, A, tgt, {});
  const fl0 = a0 && Fl().get(a0.sea);
  if (!fl0) return { err: `a invasão não nasceu (doca ${dock ? dock.id : '—'}, transporte ${tr0 ? tr0.id : '—'}, exército ${a0 ? a0.id : '—'})` };
  const FL = fl0.id, AR = a0.id; const fl = () => Fl().get(FL); const army = () => G.Wars.army(AR);
  // the crossing, until the fleet is about to reach the beach
  let k = 0; while (k++ < 12000 && fl() && Fl().live(fl()) && !(fl().st === 'travessia' && G.dist(fl().x, fl().y, fl().land.water[0], fl().land.water[1]) < 3.2)) G.debug.step(0.1);
  if (!fl() || fl().st !== 'travessia') return { err: `a frota não chegou perto da praia (${fl() ? fl().st : 'sumiu'}, exército ${army() ? army().phase : '—'})` };
  const trs = fl().ships.map(id => G.S.ships.find(s => s.id === id)).filter(s => s && s.kind === 'transporte');
  const tr = trs.find(s => Nv().aboardOf(s).length >= 4); if (!tr) return { err: `nenhum transporte com soldados a bordo (${trs.map(s => s.id + ':' + Nv().aboardOf(s).length).join(', ')})` };
  const spot = behind(fl()); if (!spot) return { err: 'nenhuma água atrás de uma ponta de terra perto da praia' };
  // the test's hand: the transport, with its soldiers, behind the point of land
  const TR = tr.id; const ship = () => G.S.ships.find(s => s.id === TR);
  tr.x = spot.x; tr.y = spot.y; tr.path = null; tr.pi = 0; for (const v of Nv().aboardOf(tr)) { v.x = tr.x; v.y = tr.y; }
  const bw = fl().land.water.slice(); const WADE = Fl().WADE || 6;
  const out = { spot: `${spot.x},${spot.y}`, d0: spot.d, sea: spot.len, n0: Nv().aboardOf(tr).length, land: 0, landAt: null, far: [], near: 0, closest: 1e9, saved: false, moved: null, st: [] };
  let was = new Set(Nv().aboardOf(tr).map(v => v.id)); let t0 = null, after = null;
  for (let j = 0; j < 1500; j++) {
    G.debug.step(0.1);
    const f = fl(); if (f && out.st[out.st.length - 1] !== f.st) out.st.push(f.st);
    if (f && f.st === 'desembarque' && t0 === null) { t0 = G.S.clock; out.dStart = ship() ? G.dist(ship().x, ship().y, bw[0], bw[1]) : -1; }
    // the save in the middle of the landing, with the transport still on its way round (half a second in, and still out of
    // reach of the beach)
    if (withSave && !out.saved && t0 !== null && G.S.clock - t0 >= 0.5 && ship() && G.dist(ship().x, ship().y, bw[0], bw[1]) > WADE + 1) { const s = ship(); out.before = [s.x, s.y]; out.dSave = G.dist(s.x, s.y, bw[0], bw[1]); M.salvarCarregar(); out.saved = true; after = G.S.clock; }
    const s = ship(); if (!s) break;
    if (out.saved && out.moved === null && G.S.clock - after >= 3) out.moved = +G.dist(s.x, s.y, out.before[0], out.before[1]).toFixed(2);
    if (onLand(s.x, s.y)) { out.land++; if (!out.landAt) out.landAt = `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }
    const dd = G.dist(s.x, s.y, bw[0], bw[1]); if (dd < out.closest) out.closest = dd;
    const now = new Set(Nv().aboardOf(s).map(v => v.id));
    for (const id of was) if (!now.has(id) && G.S.villagers.has(id)) { if (dd > WADE) out.far.push(+dd.toFixed(1)); else out.near++; }
    was = now;
    if (f && t0 !== null && f.st !== 'desembarque' && f.st !== 'combate') break;
  }
  if (out.saved && out.moved === null && ship()) out.moved = +G.dist(ship().x, ship().y, out.before[0], out.before[1]).toFixed(2);
  out.left = ship() ? Nv().aboardOf(ship()).length : 0; out.WADE = WADE; out.bad = fresh(); return out;
}
for (const [name, withSave] of [['n1 a invasão com um transporte atrás de uma ponta de terra', false], ['n2 o mesmo, com um save no meio do desembarque', true]]) {
  const r = landing(withSave);
  if (r.err) { ok(name, false, r.err); continue; }
  const info = `o transporte a ${r.d0.toFixed(1)} casas da praia (${r.sea.toFixed(1)} pelo mar; ${r.dStart >= 0 ? r.dStart.toFixed(1) : '—'} quando o desembarque começou), ${r.n0} soldados a bordo; frota ${r.st.join(' → ')}; ` +
    `${r.land ? `EM TERRA ${r.land} passos (o primeiro em ${r.landAt})` : 'nunca em terra'}; chegou a ${r.closest.toFixed(1)} casas da praia; ` +
    `${r.far.length ? `${r.far.length} soldados desceram LONGE da praia (a ${r.far.slice(0, 4).join(', ')} casas)` : 'ninguém desceu longe da praia'}, ${r.near} desceram na praia, ${r.left} ficaram a bordo` +
    `${withSave ? (r.saved ? `; salvo e carregado a ${r.dSave.toFixed(1)} casas da praia, andou ${r.moved} casas nos 3 s seguintes` : '; NÃO houve o save (o transporte já estava perto da praia)') : ''}; verificador: ${r.bad.slice(0, 3).join(' · ') || 'nada novo'}`;
  ok(name, !r.land && !r.far.length && r.near >= Math.min(4, r.n0) && r.closest <= r.WADE && (!withSave || (r.saved && r.moved > 1)) && !r.bad.length && M.limpo(), info);
}

// ------------------------------ n3, n4: land raised across a boat's way home ------------------------------
// (the course, by rule: from open water 14 to 24 tiles off the quay's mooring, the sea path home is one straight leg — its
// middle at least 3.6 tiles from any land, so that the hill rises out of the sea —; the nearest such water, then the first)
// (for the sea that opens, n5, also a way for it there — two shores near enough — whose bed takes neither end of the leg)
function across(moor, way) {
  const N = G.N; const c = Nv().compAt(moor[0], moor[1]); let best = null;
  for (let i = 0; i < N * N; i++) {
    const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; const d = G.dist(x, y, moor[0], moor[1]); if (d < 14 || d > 24) continue;
    if (!open(x, y) || Nv().compAt(x, y) !== c) continue;
    const mx = (x + moor[0]) / 2, my = (y + moor[1]) / 2; let clear = true;
    for (let dy = -4; dy <= 4 && clear; dy++) for (let dx = -4; dx <= 4; dx++) { const qx = Math.floor(mx) + dx + 0.5, qy = Math.floor(my) + dy + 0.5; if (G.dist(qx, qy, mx, my) <= 3.6 && !water(qx, qy)) { clear = false; break; } }
    if (!clear) continue;
    const p = Nv().seaPath(x, y, moor[0], moor[1]); if (!p || p.length !== 1) continue;
    if (way) { const wy = G.Powers.seaWay(mx, my); if (!wy || wy.tiles.some(t => G.dist((t % N) + 0.5, ((t / N) | 0) + 0.5, x, y) < 2.5 || G.dist((t % N) + 0.5, ((t / N) | 0) + 0.5, moor[0], moor[1]) < 2.5)) continue; }
    if (!best || d < best.d - 1e-9) best = { x, y, d, mx, my };
  }
  return best;
}
// the test's hand: a fisherman aboard, the boat out at sea on that water, on its way home with the catch
function boatOut(way) {
  const { A, dock } = mundo(); base = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
  const b0 = dock && Nv().spawn('pesca', A, dock); if (!b0) return { err: 'nenhum barco de pesca' };
  const moor = Nv().dockInfo(dock).moor; const sp = across(moor, way); if (!sp) return { err: `nenhum rumo reto e longo para o cais${way ? ' com duas margens perto do meio' : ''}` };
  const set = G.S.settlements.get(dock.set);
  const v = [...G.S.villagers.values()].filter(q => q.set === set.id && !q.aboard && !q.captive && q.age >= 18 && q.age < 50 && !(q.task && (q.task.pri || 0) >= 3) && !G.Vg.handsBusy(q) && !(G.Expe && G.Expe.memberOf(q.id)) && !(G.Wars.armyOf && G.Wars.armyOf(q))).sort((p, q) => p.id - q.id)[0];
  if (!v) return { err: 'ninguém livre para pescar' };
  b0.x = sp.x; b0.y = sp.y; Nv().board(v, b0); v.x = b0.x; v.y = b0.y; b0.st = 'back'; b0.t = 0; b0.cargo = 3; Nv()._sailTo(b0, moor[0], moor[1]);
  const ID = b0.id; return { boat: () => G.S.ships.find(s => s.id === ID), moor, sp, legs: b0.path ? b0.path.length : 0 };
}
// the boat on its way: on land, on the dry bed of a parted sea, home at the mooring
function watch(o, out, secs) {
  for (let j = 0; j < secs * 10; j++) {
    G.debug.step(0.1); const s = o.boat(); if (!s) break;
    if (onLand(s.x, s.y)) { out.land++; if (!out.landAt) out.landAt = `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }
    if (G.S.dry && G.S.dry[W.idx(s.x, s.y)]) { out.bed++; if (!out.bedAt) out.bedAt = `${s.x.toFixed(1)},${s.y.toFixed(1)}`; }
    if (s.st === 'unload' || s.st === 'idle') { out.home = G.dist(s.x, s.y, o.moor[0], o.moor[1]) < 0.6; out.at = G.dist(s.x, s.y, o.moor[0], o.moor[1]); out.t = +(j / 10).toFixed(1); break; }
  }
  out.bad = fresh(); return out;
}
function hill(withSave) {
  const o = boatOut(false); if (o.err) return o;
  G.debug.step(0.1);
  // the god raises land in the middle of that way home
  G.S.faith = 1e7; const cast = G.Powers.cast('raise', o.sp.mx, o.sp.my);
  const risen = onLand(o.sp.mx, o.sp.my);
  if (withSave) M.salvarCarregar();
  return watch(o, { legs: o.legs, cast, risen, land: 0, landAt: null, bed: 0, home: false, t: 0, d0: o.sp.d }, 90);
}
for (const [name, withSave] of [['n3 o deus ergue terra no meio do rumo de um barco que volta ao cais', false], ['n4 o mesmo, com um save logo depois do morro', true]]) {
  const r = hill(withSave);
  if (r.err) { ok(name, false, r.err); continue; }
  ok(name, r.legs === 1 && r.cast && r.risen && !r.land && r.home && !r.bad.length && M.limpo(),
    `o barco a ${r.d0.toFixed(1)} casas do cais, o rumo de ${r.legs} trecho(s); o morro ${r.cast && r.risen ? 'subiu no meio dele' : 'NÃO subiu'}; ` +
    `${r.land ? `EM TERRA ${r.land} passos (o primeiro em ${r.landAt})` : 'nunca em terra'}; ${r.home ? `chegou ao cais em ${r.t} s` : 'NÃO chegou ao cais'}; verificador: ${r.bad.slice(0, 3).join(' · ') || 'nada novo'}`);
}
// ------------------------------ n5: the sea opened across a boat's way home ------------------------------
// (the same flaw beside L-454: when the sea opens, the course of a ship was plotted again only when one of its turns fell on the
// bed — openUp, seapart.js —, and a boat whose straight leg crossed the bed sailed on into the wall, over the dry ground)
{
  const name = 'n5 o deus abre o mar no meio do rumo de um barco que volta ao cais';
  const o = boatOut(true);
  if (o.err) ok(name, false, o.err);
  else {
    G.debug.step(0.1);
    G.S.faith = 1e7; const cast = G.Powers.cast('seapart', o.sp.mx, o.sp.my);
    const out = { legs: o.legs, cast, land: 0, landAt: null, bed: 0, bedAt: null, home: false, t: 0, d0: o.sp.d };
    // (the walls of water stand up three seconds after the word: the boat is still on its way, short of the middle)
    for (let j = 0; j < 35; j++) G.debug.step(0.1);
    out.open = !!(G.S.dry && G.S.dry[W.idx(o.sp.mx, o.sp.my)]); out.short = o.boat() ? G.dist(o.boat().x, o.boat().y, o.sp.mx, o.sp.my) : 0;
    const r = watch(o, out, 60); const b = o.boat();
    r.now = b ? `${b.st}, ${b.path && b.pi < b.path.length ? `${b.path.length - b.pi} trecho(s) de rumo à frente` : 'sem rumo'}, a ${G.dist(b.x, b.y, o.moor[0], o.moor[1]).toFixed(1)} casas do cais` : 'sumiu';
    ok(name, r.legs === 1 && r.cast && r.open && r.short > 1.5 && !r.bed && !r.land && !r.bad.length && M.limpo(),
      `o barco a ${r.d0.toFixed(1)} casas do cais, o rumo de ${r.legs} trecho(s); o mar ${r.cast && r.open ? `se abriu no meio dele (o barco a ${r.short.toFixed(1)} casas do fundo)` : 'NÃO se abriu'}; ` +
      `${r.bed ? `NO FUNDO SECO ${r.bed} passos (o primeiro em ${r.bedAt})` : 'nunca no fundo seco'}; ${r.land ? `EM TERRA ${r.land} passos` : 'nunca em terra'}; ` +
      `${r.home ? `chegou ao cais em ${r.t} s` : r.t ? `parou a ${r.at.toFixed(1)} casas do cais (sem caminho pelo mar com o fundo aberto)` : `ainda no caminho depois de 60 s (${r.now})`}; verificador: ${r.bad.slice(0, 3).join(' · ') || 'nada novo'}`);
  }
}
// ------------------------------ n6: the checker sees a ship left at rest on land ------------------------------
// (the transport of L-453 lay on the sand at anchor 37 acts before a fleet took it and the checker saw it sail there: T-344.
// The test's hand leaves a boat at its quay on the nearest sand — the checker must say so — and puts it back on the water)
{
  const name = 'n6 o verificador vê o navio deixado parado em terra';
  const { A, dock } = mundo(); const b0 = dock && Nv().spawn('pesca', A, dock);
  if (!b0) ok(name, false, 'nenhum barco de pesca');
  else {
    const N = G.N; let sand = null, bd = 1e9;
    for (let i = 0; i < N * N; i++) { const x = (i % N) + 0.5, y = ((i / N) | 0) + 0.5; if (G.S.type[i] !== T.SAND || G.S.occ[i]) continue; const d = G.dist(x, y, b0.x, b0.y); if (d < bd) { bd = d; sand = [x, y]; } }
    const x0 = b0.x, y0 = b0.y; const seen = q => q.sys === 'sea' && q.sev <= 2 && q.msg.includes(`pesca#${b0.id}: parado (idle) em terra`);
    const before = QA.check().some(seen);
    b0.x = sand[0]; b0.y = sand[1]; const on = QA.check().filter(seen).map(q => q.msg);
    b0.x = x0; b0.y = y0; const after = QA.check().some(seen);
    ok(name, !before && on.length === 1 && !after, `o barco no cais: ${before ? 'ACUSADO' : 'nada'}; posto na areia a ${bd.toFixed(1)} casas: ${on.length ? `«${on[0]}»` : 'o verificador NÃO viu'}; de volta à água: ${after ? 'AINDA acusado' : 'nada'}`);
  }
}
// (no summary line: the sea's files are counted line by line, as the mar17.js cases — the exit code tells it all)
const e = M.erros(); console.log('erros', M.limpo() ? 'nenhum' : JSON.stringify(e.mod) + ' ' + e.console.slice(0, 5).join(' | '));
process.exit(fails.length ? 1 : 0);
