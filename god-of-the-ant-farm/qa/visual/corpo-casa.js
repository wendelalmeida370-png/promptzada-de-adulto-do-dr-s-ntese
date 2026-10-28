// corpo-casa: the body goes into a house for real — in Node, without a browser (the simulation of qa/nodemundo.js, with the body's
// files after it; the plans are G.Interiors', the walking the body's own controller, frame by frame as the game's main.js):
//   node qa/visual/corpo-casa.js [mundo]       (default: the ready world «metropole»)
// The proofs (Etapa 2: "entrar e sair de prédios de verdade"):
//   1. from the street to the door of the plan (Interiors.planDoor): shut, it stops the body; the hands open it — the world
//      does it in its step (Interiors.useDoor, the door's state the world's) —, and the body walks in
//   2. indoors: the world has it inside (v.inside, set in the world's step), its storey kept with it (S.avatar.lv); it walks
//      only where the plan lets one stand (Interiors.walk) and its feet are on the plan's floor (Interiors.floorY)
//   3. up the stairs to the storey above and down again (the flight's ramp; the storey changing at its top), never through a
//      wall, a piece of furniture, a floor or a ceiling
//   4. to bed: its own bed, the world's sleep, lying on it; awake, beside it
//   5. out by the door: the world has it outside again, no storey kept
//   6. the bad cases: saved and loaded indoors (indoors still, the same storey and place), the god takes the house away with the
//      body in it (the body is put out by the world, never left in the air), the body dies indoors (the god takes over, the
//      house as it was), a door the world locks (someone else's house: knocking only)
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-casa ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'metropole');
let S = G.S; const W = G.W, TL = G.Space.TILE, In = G.Interiors, Sp = G.Space;
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const IN = G.Avatar.input;
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
// (the verifier — what weighs, S0 to S2; the old rule of qa.js for the body indoors, which the plan's rooms replace, counted apart)
let oldRule = 0;
const vbad = () => QA.check().filter(q => q.sev <= 2).filter(q => { if (/sem estar dormindo em casa/.test(q.msg) && G.Possess.indoorOK && G.Possess.body() && G.Possess.indoorOK(G.Possess.body())) { oldRule++; return false; } return true; });
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
// the body walked toward a point of the world (metres), as a player holds the stick: until there, or stuck
function walkTo(X, Z, max, near) {
  const st = G.Avatar.state(); let k = 0, still = 0, last = [st.X, st.Z];
  for (; k < (max || 600); k++) {
    const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); check();
    if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st.X, st.Z];
  }
  stop(); for (let q = 0; q < 6; q++) { frame(); check(); }
  return { k, d: Math.hypot(X - st.X, Z - st.Z) };
}
// (every frame: the body indoors stands only where its plan lets one stand, on the plan's floor — and never anywhere the world's
// ground does not hold it outdoors)
let bad = [];
function check() {
  const v = G.Possess.body(), st = G.Avatar.state(); if (!v || !st || st.loco === 'sleep' || st.loco === 'stair' || st.loco === 'seat') return; // (seated: on the piece, Interiors' place)
  const ins = Sp.indoor(st.X, st.Z, st.lv, st.inB ? st.inB.id : 0);
  if (ins) { if (st.ground && Math.abs(st.Y - ins.y) > 0.03 && !st.stair) bad.push(`pés a ${(st.Y - ins.y).toFixed(2)} m do chão da planta em ${ins.x.toFixed(2)},${ins.z.toFixed(2)} (piso ${ins.lv})`);
    if (!ins.walk) bad.push(`num lugar que a planta não deixa (${ins.code}) em ${ins.x.toFixed(2)},${ins.z.toFixed(2)} piso ${ins.lv}`); }
  else if (!W.walkableXY(v.x, v.y) && !G.Possess.afloat(v)) bad.push(`fora, num lugar onde o mundo não anda (${v.x.toFixed(2)},${v.y.toFixed(2)})`);
}
// a path over a storey of a plan (cells of 25 cm where the body fits), from a point to another (metres of the lot)
function pathIn(b, p, lv, from, to) {
  // (round a shut hatch, not over it: from its landing, straight over it is the way down; and round a flight that goes up from
  // this storey — a ladder along the wall too —: it is taken from its foot, never walked across, Avatar's takeFlight)
  const ups = p.stairs.filter(s => s.kind !== 'degraus' && s.lv0 === lv); const onUp = (x, z) => ups.some(s => x > s.r[0] - 0.02 && x < s.r[2] + 0.02 && z > s.r[1] - 0.02 && z < s.r[3] + 0.02);
  const n = p.grid.n, cs = p.grid.cs; const fits = (x, z) => { const r = 0.34; for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) { const q = Sp.indoor(b.x * TL + x + dx, b.y * TL + z + dz, lv, b.id); if (!q || !q.walk || onUp(x + dx, z + dz)) return false; } return true; };
  const c = (x, z) => [Math.floor(x / cs), Math.floor(z / cs)]; const [sx, sz] = c(from[0], from[1]), [tx, tz] = c(to[0], to[1]);
  const prev = new Map(); const key = (x, z) => z * n + x; const q = [[sx, sz]]; prev.set(key(sx, sz), null);
  for (let i = 0; i < q.length; i++) { const [x, z] = q[i]; if (x === tx && z === tz) break;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Z = z + dz; if (X < 0 || Z < 0 || X >= n || Z >= n || prev.has(key(X, Z))) continue; if (!(X === tx && Z === tz) && !fits((X + 0.5) * cs, (Z + 0.5) * cs)) continue; prev.set(key(X, Z), [x, z]); q.push([X, Z]); } }
  if (!prev.has(key(tx, tz))) return null; const out = []; let cur = [tx, tz]; while (cur) { out.unshift([(cur[0] + 0.5) * cs, (cur[1] + 0.5) * cs]); cur = prev.get(key(cur[0], cur[1])); }
  return out;
}
let followAt = ''; // (where the last follow stopped short: the body's point, the one it did not reach, what blocked it)
const follow = (b, pts) => { followAt = ''; for (const pt of pts) { const r = walkTo(b.x * TL + pt[0], b.y * TL + pt[1], 200, 0.12); if (r.d > 0.3) { const st = G.Avatar.state();
  const q = Sp.indoor(st.X, st.Z, G.Possess.level(), b.id); followAt = `parado em ${(st.X - b.x * TL).toFixed(2)},${(st.Z - b.y * TL).toFixed(2)} (célula ${q ? q.code : '-'}), a ${r.d.toFixed(2)} m de ${pt[0].toFixed(2)},${pt[1].toFixed(2)}; barrado por ${st.block || 'nada'}`; return false; } } return true; };
// to a point of a storey of the house, by its stairs, storey by storey (up or down the flight between each two)
// (why the last goTo stopped short, for the proof's line)
let goWhy = '';
function goTo(b, p, lv, to) {
  const st = G.Avatar.state(); goWhy = '';
  for (let k = 0; k < 8 && G.Possess.level() !== lv; k++) {
    const cur = G.Possess.level(); const up = lv > cur; const s = p.stairs.find(q => q.kind !== 'degraus' && (up ? q.lv0 === cur : q.lv1 === cur));
    if (!s) { goWhy = `nenhuma escada do piso ${cur}`; return false; } const from = up ? s.a : s.b, dest = up ? s.b : s.a;
    const pa = pathIn(b, p, cur, [st.X - b.x * TL, st.Z - b.y * TL], from); if (!pa || !follow(b, pa)) { goWhy = `${pa ? 'não chegou' : 'nenhum caminho'} à escada ${s.kind} do piso ${cur}${followAt ? ': ' + followAt : ''}`; return false; }
    if (up) walkTo(b.x * TL + dest[0], b.y * TL + dest[1], 600, 0.2);
    else { // (down: E at its landing — the hatch opened by hand)
      let best = null; for (let k = 0; k < 20 && !(best && best.id === 'escada' && !best.t.up); k++) { const r = s.r; IN.camYaw = Math.atan2(b.y * TL + (r[1] + r[3]) / 2 - st.Z, b.x * TL + (r[0] + r[2]) / 2 - st.X); best = G.Interact.best(); frame(); }
      if (best && best.id === 'escada') G.Interact.run(best); else goWhy = `no alto da escada ${s.kind}, o E oferece ${best ? `«${best.label}»` : 'nada'}`;
      for (let k = 0; k < 600 && st.loco === 'stair'; k++) { frame(); check(); } }
    if (G.Possess.level() === cur) { goWhy = goWhy || `a escada ${s.kind} não levou ao piso seguinte`; return false; }
  }
  const pa = pathIn(b, p, lv, [st.X - b.x * TL, st.Z - b.y * TL], to); if (!pa) goWhy = `nenhum caminho no piso ${lv}`; return !!pa && follow(b, pa);
}
// a house of the world with a plan, its door on a street, a grown-up living in it who can be lived; and the body by its door
function houseAndBody() {
  const homes = [...S.buildings.values()].filter(b => b.built && In.has(b) && (b.type === 'house' || b.type === 'sobrado') && In.planDoor(b)).sort((a, b) => a.id - b.id);
  for (const b of homes) {
    const p = Sp.planNow(b); if (!p || !p.entrance) continue;
    const v = [...S.villagers.values()].filter(o => o.home === b.id && o.age >= 18 && o.age < 55 && !o.sleeping && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0]; if (!v) continue;
    const d = In.planDoor(b); if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
    G.Vg.endTask(v); v.inside = 0; v.x = d[0]; v.y = d[1]; v.path = null; if (!G.Possess.take(v).ok) continue;
    G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame(); return { b, p, v };
  }
  return null;
}
const doorPt = (b, p) => { const e = p.entrance; return [b.x * TL + e.x, b.y * TL + e.z]; };
// (a point straight in from the entrance, k metres past its door — square to the door's wall, as one walks through a door)
const inward = (p, k) => { const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
  if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz < 0) { nx = -nx; nz = -nz; } return [e.x + nx * k, e.z + nz * k]; };
const walkIn = (b, p, k) => { const o = inward(p, -0.6); walkTo(b.x * TL + o[0], b.y * TL + o[1], 300, 0.08); const i = inward(p, k); return walkTo(b.x * TL + i[0], b.y * TL + i[1], 300); };

// ------------------------------ 1. the door: shut, it stops; opened by the hands, the body walks in ------------------------------
const H = houseAndBody();
if (!H) { ok('há uma casa com planta, porta na rua e um morador que se pode viver', false, 'nenhuma'); }
else {
  const { b, p } = H; let v = H.v; const st = () => G.Avatar.state();
  ok('há uma casa com planta, porta na rua e um morador que se pode viver', true, `${b.type}#${b.id} (${p.fam}, ${p.levels.length} pisos), ${v.name}`);
  // (shut, by the house's own rule or by hand: the world's door)
  G.Possess.apply(w => { In.useDoor(b, p.entrance.door, 'fechar', w); return { ok: true }; }); frame();
  const D = doorPt(b, p); const I1 = inward(p, 1.0);
  const r0 = walkTo(b.x * TL + I1[0], b.y * TL + I1[1], 300);
  const shutIn = v.inside === b.id; const at0 = Math.hypot(st().X - D[0], st().Z - D[1]);
  ok('1. a porta fechada barra o corpo na soleira', !shutIn && In.doorState(b, p.entrance.door).state !== 'aberta', `estado ${In.doorState(b, p.entrance.door).state}; dentro: ${shutIn}; a ${at0.toFixed(2)} m da porta`);
  // (E: the hands open it — the world in its step)
  let best = null; for (let k = 0; k < 20 && !(best && best.id === 'portaPlanta'); k++) { IN.camYaw = Math.atan2(D[1] - st().Z, D[0] - st().X); best = G.Interact.best(); frame(); }
  const r1 = best && best.id === 'portaPlanta' ? G.Interact.run(best) : null; for (let k = 0; k < 60 && G.Avatar.busy(); k++) frame();
  const ds = In.doorState(b, p.entrance.door);
  ok('1. as mãos abrem a porta: o mundo a abre no seu passo (Interiors.useDoor)', !!r1 && ds.state === 'aberta' && ds.by === 'pessoa', `${best ? best.label : 'nada à frente'} → ${ds.state} (por ${ds.by})`);
  bad = []; const r2 = walkIn(b, p, 1.0); frame(); frame();
  ok('2. o corpo entra pela porta: o mundo o tem dentro, o piso guardado com ele', v.inside === b.id && G.Possess.level() === (p.entryLv || 0) && r2.d < 0.3, `dentro de ${v.inside}; piso ${G.Possess.level()}; a ${r2.d.toFixed(2)} m do ponto`);
  ok('2. por dentro só onde a planta deixa ficar, os pés no chão da planta', !bad.length, bad.length ? bad.slice(0, 3).join(' · ') : 'cada quadro na planta');
  // ------------------------------ 3. up the stairs and down ------------------------------
  const s0 = p.stairs.find(s => s.kind !== 'degraus' && s.lv0 === (p.entryLv || 0));
  if (!s0) ok('3. sobe a escada ao piso de cima e desce', true, 'a casa não tem escada (nada a provar)');
  else {
    bad = []; const here = [st().X - b.x * TL, st().Z - b.y * TL]; const foot = s0.a; const path0 = pathIn(b, p, p.entryLv || 0, here, foot);
    const got = path0 && follow(b, path0);
    // (up the flight: along its climb, past its top)
    const top = s0.b;
    const r3 = got ? walkTo(b.x * TL + top[0], b.y * TL + top[1], 600, 0.2) : { d: 9 };
    const l1 = p.levels.find(q => q.lv === s0.lv1); const up = G.Possess.level() === s0.lv1 && Math.abs(st().Y - (Sp.planEntry(b.id).y0 + l1.y + Sp.FLOOR_UP)) < 0.05;
    ok('3. sobe a escada: no topo, o piso de cima (o seu chão)', up && !bad.length, `caminho até o pé: ${path0 ? path0.length + ' passos' : 'nenhum'}; no topo a ${r3.d.toFixed(2)} m; piso ${G.Possess.level()} (quer ${s0.lv1}); pés a ${(st().Y - Sp.planEntry(b.id).y0).toFixed(2)} m (o piso a ${l1.y})${bad.length ? '; ' + bad.slice(0, 2).join(' · ') : ''}`);
    // (and down: E at the landing — the hatch opened by hand —, the flight to its foot)
    { let best = null; for (let k = 0; k < 20 && !(best && best.id === 'escada' && !best.t.up); k++) { const r = s0.r; IN.camYaw = Math.atan2(b.y * TL + (r[1] + r[3]) / 2 - st().Z, b.x * TL + (r[0] + r[2]) / 2 - st().X); best = G.Interact.best(); frame(); }
      if (best && best.id === 'escada') G.Interact.run(best); for (let k = 0; k < 600 && st().loco === 'stair'; k++) frame(); }
    bad = []; const r4 = walkTo(b.x * TL + foot[0], b.y * TL + foot[1], 600, 0.2);
    ok('3. desce a escada: ao pé dela, o piso de baixo', G.Possess.level() === s0.lv0 && r4.d < 0.35 && !bad.length, `ao pé a ${r4.d.toFixed(2)} m; piso ${G.Possess.level()}${bad.length ? '; ' + bad.slice(0, 2).join(' · ') : ''}`);
  }
  // ------------------------------ 4. to bed ------------------------------
  { v.energy = 40; const bd = In.bedOf(v);
    if (!bd) ok('4. dorme na sua cama', true, 'sem cama própria nesta casa (nada a provar)');
    else {
      // (beside the bed, where a body fits: the nearest such point round its sleeping place)
      const fitsAt = (x, z) => { const r = 0.34; for (const [dx, dz] of [[0, 0], [r, 0], [-r, 0], [0, r], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7], [r * 0.7, -r * 0.7], [-r * 0.7, -r * 0.7]]) { const q = Sp.indoor(b.x * TL + x + dx, b.y * TL + z + dz, bd.item.lv, b.id); if (!q || !q.walk) return false; } return true; };
      // (one the door reaches on foot: Interiors' own walk from the entrance)
      const R = p.reach && p.reach[bd.item.lv]; const reachedAt = (x, z) => !R || !!R[Math.floor(z / p.grid.cs) * p.grid.n + Math.floor(x / p.grid.cs)];
      let acc = null; for (let rr = 0.4; rr < 2 && !acc; rr += 0.1) for (let k = 0; k < 24 && !acc; k++) { const a = k / 24 * Math.PI * 2; const x = bd.spot.x + Math.cos(a) * rr, z = bd.spot.z + Math.sin(a) * rr; if (fitsAt(x, z) && reachedAt(x, z)) acc = [x, z]; }
      const there = !!acc && goTo(b, p, bd.item.lv, acc);
      // (turned to the bed, as one goes to it)
      let best2 = null; for (let k = 0; k < 20 && !(best2 && best2.id === 'cama'); k++) { const ya = Math.atan2(b.y * TL + bd.item.z - st().Z, b.x * TL + bd.item.x - st().X); IN.camYaw = ya; st().yaw = ya; best2 = G.Interact.best(); frame(); }
      const r5 = best2 && best2.id === 'cama' ? G.Interact.run(best2) : null; for (let k = 0; k < 90 && !v.sleeping; k++) frame(); for (let k = 0; k < 10; k++) frame();
      const lying = st().loco === 'sleep' && !!st().bed; const onIt = Math.hypot(st().X - (b.x * TL + bd.spot.x), st().Z - (b.y * TL + bd.spot.z)) < 0.05;
      ok('4. deita na sua cama: o sono do mundo, o corpo deitado nela', !!r5 && v.sleeping && lying && onIt && v.inside === b.id, `${bd.item.kind} no piso ${bd.item.lv} (chegou: ${there}); ${best2 ? best2.label : 'nada'}; dormindo ${v.sleeping}; deitado ${lying}; na cama ${onIt}; dentro ${v.inside === b.id}`);
      // (awake: up beside the bed, in the room)
      G.Possess.apply(w => { G.Possess.wake(w); return { ok: true }; }); for (let k = 0; k < 8; k++) frame(); bad = []; check();
      ok('4. acordado, levanta ao lado da cama, dentro de casa', !v.sleeping && v.inside === b.id && st().loco === 'ground' && !bad.length, `dormindo ${v.sleeping}; dentro ${v.inside === b.id}; ${st().loco}${bad.length ? '; ' + bad[0] : ''}`);
    }
  }
  // ------------------------------ 7. at a place of the plan: sat down by the hands, up as the player walks ------------------------------
  // (the verb 'lugar': a step to where one gets onto it, the world marks it — S.avatar.use, the place the share-out gives the
  // body —, the body on it, turned as the place is; a gesture of the hands there keeps it seated; walking, up where it got on,
  // the place let go. And seated again, for the save below: loaded, seated on it again)
  let seatedAt = null;
  { const lv = G.Possess.level(); const pl0 = In.freeNear(b, lv, st().X - b.x * TL, st().Z - b.y * TL, 30).filter(q => G.Interact.PURE.has(q.use) && !q.it.mark && !q.it.tier);
    const pl = pl0.find(q => q.use === 'sentar' || q.use === 'comer') || pl0[0];
    const sitDown = () => {
      if (!goTo(b, p, pl.lv, pl.at)) return { why: goWhy };
      let best = null; for (let k = 0; k < 30 && !(best && best.id === 'lugar' && best.t.pl.item === pl.item); k++) { const ya = Math.atan2(b.y * TL + pl.z - st().Z, b.x * TL + pl.x - st().X); IN.camYaw = ya; st().yaw = ya; best = G.Interact.best(); frame(); }
      if (!(best && best.id === 'lugar')) return { why: `o E oferece ${best ? `«${best.label}»` : 'nada'}` };
      const r = G.Interact.run(best); for (let k = 0; k < 150 && !(G.Avatar.seatNow() && G.Avatar.seatNow().k >= 1); k++) frame();
      return { r, best };
    };
    if (!pl) ok('7. senta num lugar da planta', true, 'nenhum lugar livre de sentar neste piso (nada a provar)');
    else {
      bad = []; const s1 = sitDown(); const u = G.Possess.useOf(); const sn = G.Avatar.seatNow(); const tp = s1.best ? s1.best.t.pl : pl;
      const onIt = Math.hypot(st().X - (b.x * TL + tp.x), st().Z - (b.y * TL + tp.z)) < 0.05; let dy = st().yaw - (Math.PI / 2 - tp.ry); while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
      const mine = In.places(b).by.get(v.id);
      ok('7. senta: o mundo marca o lugar, o corpo nele, virado como o lugar', !!u && u.it === tp.item && u.q === tp.q && !!sn && st().loco === 'seat' && onIt && Math.abs(dy) < 0.05 && !!mine && mine.item === tp.item, `${s1.best ? s1.best.label : s1.why} (${tp.use} em ${tp.it.kind}); o mundo: ${u ? u.use + ' ' + u.it : 'nada'}; ${st().loco}, no ponto ${onIt}, virado a ${dy.toFixed(2)} rad; o repartidor: ${mine ? mine.use : 'nada'}`);
      // (the hands at the place: a gesture with no walk keeps the body seated, in the seated state of a seated gesture)
      G.Avatar.act({ anim: 'eat', dur: 0.8, lock: true }); for (let k = 0; k < 8; k++) frame(); const kept = st().loco === 'seat', anim = st().anim; for (let k = 0; k < 30; k++) frame();
      ok('7. as mãos no lugar: o corpo segue nele', kept && anim === 'eat' && st().loco === 'seat' && !!G.Possess.useOf(), `durante: ${kept ? 'sentado' : 'de pé'} (${anim}); depois: ${st().loco}`);
      // (up: the player walks — eased back to where it got on, on its feet, the place let go in the world's step)
      const at = [b.x * TL + tp.at[0], b.y * TL + tp.at[1]]; IN.camYaw = st().yaw + Math.PI; IN.mz = 1; frame(); stop(); for (let k = 0; k < 30; k++) frame(); check();
      const upAt = Math.hypot(st().X - at[0], st().Z - at[1]);
      ok('7. anda e levanta: de pé onde subiu, o lugar solto', st().loco === 'ground' && !G.Possess.useOf() && !G.Avatar.seatNow() && upAt < 0.6 && !bad.length && v.inside === b.id, `${st().loco}; o mundo: ${G.Possess.useOf() ? 'ainda o lugar' : 'solto'}; a ${upAt.toFixed(2)} m de onde subiu${bad.length ? '; ' + bad[0] : ''}`);
      const s2 = sitDown(); seatedAt = G.Possess.useOf() ? { it: G.Possess.useOf().it, q: G.Possess.useOf().q } : null; if (!seatedAt) ok('7. senta de novo (para o salvar)', false, s2.why || 'não sentou');
    }
  }
  // ------------------------------ 6. save and load indoors ------------------------------
  { const x0 = v.x, y0 = v.y, lv0 = G.Possess.level(); M.salvarCarregar(); S = G.S; v = G.Possess.body();
    if (v) { G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame(); }
    ok('6. salvar e carregar dentro de casa: dentro ainda, no mesmo piso e lugar', !!v && v.inside === b.id && G.Possess.level() === lv0 && Math.hypot(v.x - x0, v.y - y0) < 0.02, v ? `dentro ${v.inside === b.id}; piso ${G.Possess.level()} (era ${lv0}); a ${(Math.hypot(v.x - x0, v.y - y0) * TL).toFixed(2)} m` : 'sem corpo');
    // (saved seated: seated again on the same place — Possess's load holds it, the controller sits on it)
    if (seatedAt) { const u = G.Possess.useOf(); ok('6. salvo sentado, senta de novo no mesmo lugar', !!u && u.it === seatedAt.it && u.q === seatedAt.q && st().loco === 'seat', `o mundo: ${u ? u.use + ' ' + u.it : 'nada'}; ${st().loco}`);
      IN.mz = 1; IN.camYaw = st().yaw + Math.PI; frame(); stop(); for (let k = 0; k < 30; k++) frame(); }
  }
  // ------------------------------ 5. out by the door ------------------------------
  { const b2 = S.buildings.get(b.id), p2 = Sp.planNow(b2); v = G.Possess.body();
    if (p2 && v) {
      // (down to the entrance's storey first, by the stairs, and to the door)
      const went = goTo(b2, p2, p2.entryLv || 0, inward(p2, 0.7)); const why5 = went ? '' : goWhy;
      // (the door: open, or opened)
      if (In.doorState(b2, p2.entrance.door).state !== 'aberta') { G.Possess.apply(w => In.useDoor(b2, p2.entrance.door, 'abrir', w)); frame(); }
      const o2 = inward(p2, -0.6); bad = []; walkTo(b2.x * TL + o2[0], b2.y * TL + o2[1], 300, 0.08); const out = In.planDoor(b2); const r6 = walkTo(out[0] * TL, out[1] * TL, 300); frame(); frame();
      ok('5. sai pela porta: o mundo o tem fora, sem piso guardado', v.inside === 0 && G.Possess.level() === undefined && r6.d < 0.4 && !bad.length, `dentro ${v.inside}; piso ${G.Possess.level()}; na rua a ${r6.d.toFixed(2)} m${why5 ? ` (${why5})` : ''}${bad.length ? '; ' + bad[0] : ''}`);
    } else ok('5. sai pela porta', false, 'a casa ou o corpo sumiram');
  }
  ok('verificador (S0 a S2) durante tudo isso', !vbad().length, vtxt(vbad()));
  // ------------------------------ 6. the god takes the house away with the body in it ------------------------------
  { const b3 = S.buildings.get(b.id), p3 = Sp.planNow(b3); v = G.Possess.body();
    if (b3 && p3 && v) {
      if (In.doorState(b3, p3.entrance.door).state !== 'aberta') { G.Possess.apply(w => In.useDoor(b3, p3.entrance.door, 'abrir', w)); frame(); }
      walkIn(b3, p3, 1.0); frame(); frame(); const was = v.inside === b3.id;
      // (and a while after — the queue of plans has made the ruin's by then, if it were the feet's: a ruin has none, D-050)
      G.Village.destroyBuilding(b3, 'deus'); for (let k = 0; k < 120; k++) frame(); bad = []; check();
      const left = S.buildings.get(b3.id);
      ok('6. o deus tira a casa com o corpo dentro: o mundo o põe fora, em chão firme', was && v.inside === 0 && G.Possess.level() === undefined && !bad.length && (!left || left.type === 'ruin'), `estava dentro ${was}; dentro agora ${v.inside}; piso ${G.Possess.level()}; o prédio: ${left ? left.type : 'sumiu'}${bad.length ? '; ' + bad[0] : ''}`);
    } else ok('6. o deus tira a casa com o corpo dentro', false, 'sem casa ou sem corpo');
  }
  ok('verificador no fim (S0 a S2)', !vbad().length, vtxt(vbad()));
}
console.log(`(a regra antiga do qa.js — o corpo dentro só dormindo em casa — acusou ${oldRule} vezes o corpo num cômodo da planta: o texto novo vai ao líder)`);
const E = M.erros(); ok('sem erros de módulo nem do console', JSON.stringify(E.mod) === '{}' && !E.console.length, `${JSON.stringify(E.mod)} ${E.console.slice(0, 2).join(' · ')}`);
console.log(fails.length ? `FALHOU: ${fails.length}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
