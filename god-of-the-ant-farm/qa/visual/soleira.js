// soleira: the doorstep of a building with a plan — where the street meets its door —, in Node, without a browser (the world of
// qa/nodemundo.js with the 3D's own files after it, qa/visual/tres-node.js: the steps the 3D lays are there to look at):
//   node qa/visual/soleira.js [mundo]       (default: the ready world «metropole»; ONLY=1,3 runs those proofs alone)
// (L-162: the world pushed the body standing on a doorstep — the plan walks it, the world's map has it blocked, being the
// building's lot —: the push of the stuck, once a second of the world, pulled it to open ground. L-163: in a deep lot — a
// storehouse's, a barn's — the doorstep stopped a stride out of the wall, short of the street; the outer wall's face in a door's
// opening was solid where the plan's cells stopped short of it; and over a slope a door stood high over the street with no
// steps the feet could go up — the steps drawn were not the ones walked)
// The proofs:
//   1. standing 3.5 s of the world on the doorstep of 25 houses — on the plan's ground the world's map has blocked —, the door
//      open and the door shut: never moved; the verifier clean with the body's rule for its ground (Possess.onPlan), S3 too; a
//      house the world remakes meanwhile — raised to an insula in its place, its door moved —, set apart: the body taken to the
//      ground the world walks, as anyone (T-103)
//   2. 50 times in and out through doors, one after another: never pushed, no step climbed with the hands, in each time, out
//      each time
//   3. every kind of store with a plan, its door open: the body walks in from the street — up the steps before the door, or
//      before the foot of its outside flight, where it has them, as a player goes —, climbing none
//   4. the steps the feet go up are the ones the 3D lays (Space.doorFlight): over each tread the body's floor is its top, and
//      the drawing has a face there; and every flight before a door in the world whose way in the world says fits (its feet
//      walk, ground a stride before them, the body standing on each tread: Space.entryFits, L-195, L-207) is walked up, from
//      that ground to the door, on its top tread, without the hands — those it says not, the world's to move or keep, counted
//      apart (T-102; T-090: the step measured at its foot, against Avatar.TUNE.stepUp, a number beside it); and a door moved to the other side of its shell is reckoned anew, not taken for the old one (L-196); and a
//      grown tree planted in the way of the steps into the street: never in a tread — gone round, or stopped short of —, the
//      body up them without the hands where their foot walks, and the steps of before when it is gone (L-197); and the street
//      before the door taken by a building's ground: the steps reckoned anew from it, the 3D's and the feet's, none on the
//      other's lot, and the ones of before when it is open again (L-213)
//   5. saved and loaded standing on a doorstep: there still, not moved, not taken for one who swims
//   6. a house built where the body stands: never inside, never in its rooms — it came in by no door —; the world takes it out
//      as anyone (L-175); and saved and loaded in a door's opening, walking in, the world not yet having it indoors: there
//      still, and indoors by the door it came in by
//   and no module error
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | soleira ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole'; const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const part = k => !ONLY.length || ONLY.includes(String(k));
M.pronto(world);
let S = G.S; const W = G.W, TL = G.Space.TILE, In = G.Interiors, Sp = G.Space, B3 = G.Build3D;
const RDT = 1 / 30; const IN = G.Avatar.input;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const god = f => { G.inSim++; const r = f(); G.inSim--; return r; };
// (the verifier — what weighs, S0 to S3 —, with the body's rule for its ground: the old lines of qa.js for the body indoors and
// on ground the world does not walk, counted apart where the plan lets it stand — Possess.onPlan, the rule they take)
let oldRule = 0;
const bad0 = new Set(QA.check().filter(q => q.sev <= 3).map(q => q.sys + '|' + q.msg));
// (S0–S2 of everything; S3 too of the body's own rules — the world's own S3, a home out of reach and failed paths, come in its
// minutes with no body in it as well: counted apart)
const world3 = new Set(), world3who = new Set();
const vbad = () => QA.check().filter(q => {
  if (q.sev > 3 || bad0.has(q.sys + '|' + q.msg)) return false;
  if (q.sev === 3 && q.sys !== 'avatar') { world3.add(q.msg); world3who.add(q.id || q.msg); return false; }
  if (q.sys === 'avatar' && /sem estar dormindo em casa|onde ninguém pisa/.test(q.msg) && G.Possess.onPlan(G.Possess.body())) { oldRule++; return false; }
  return true;
});
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const raisedOf = p => { const l0 = p.levels.filter(l => l.kind !== 'porao' && l.kind !== 'terraco' && l.kind !== 'jirau').sort((a, c) => a.y - c.y)[0] || p.levels[0]; return !!l0 && (l0.kind === 'elevado' || p.shell.base === 'esteios'); };

// ------------------------------ the body, the doors ------------------------------
let v = [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0];
const vid = v.id;
// (a building's entrance as the feet meet it: its door's middle — world metres —, the way out of it, its doorstep — e.out —,
// the steps before it and, for a raised floor, its outside flight)
function door(b) {
  const p = Sp.planNow(b); if (!p || !p.entrance || !p.entrance.out) return null; const e = p.entrance; const h = p.holes.find(q => q.door === e.door && q.kind !== 'janela'); if (!h) return null;
  const w = p.walls[h.wall]; if (!w) return null; const l = p.levels.find(q => q.lv === w.lv); const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
  const D = [b.x * TL + w.a[0] + (w.b[0] - w.a[0]) * h.at / L, b.y * TL + w.a[1] + (w.b[1] - w.a[1]) * h.at / L]; const O = [b.x * TL + e.out[0], b.y * TL + e.out[1]];
  const u = [O[0] - D[0], O[1] - D[1]]; const ul = Math.hypot(u[0], u[1]) || 1; u[0] /= ul; u[1] /= ul;
  const fl = Sp.doorFlight(b, p.shell, { w: b.w * TL, d: b.h * TL }, w, h, l ? l.y : 0, raisedOf(p));
  const st = !fl ? p.stairs.find(q => q.kind === 'degraus' && q.lv1 === w.lv) : null;
  return { b, p, e, h, w, D, O, u, fl, st, hw: h.w };
}
// (the way in, as a player takes it — world metres: up the side flight from its lowest tread; up an outside flight from before
// its foot; else straight at the door, as far to one side of its middle as keeps clear of what the street has beside it)
function wayIn(d) {
  const { b, fl, st, D, u } = d; const Wd = q => [b.x * TL + q[0], b.y * TL + q[1]]; const pts = [];
  const clearAt = (X, Z) => { const x = X / TL, y = Z / TL; if (!W.inb(x, y)) return false; const id = S.occ[W.idx(x, y)]; if (id === b.id) { const q = Sp.indoor(X, Z); return !!q && q.walk; } return W.walkableXY(x, y); };
  if (fl && fl.treads.some(t => t.kind === 'side')) { const side = fl.treads.filter(t => t.kind === 'side').sort((a, c) => c.k - a.k); const lo = side[0];
    pts.push(Wd(fl.P(lo.a, lo.n + lo.wn / 2 + 0.5))); for (const t of side) pts.push(Wd(fl.P(t.a, t.n))); pts.push(Wd(fl.P(0, 0.3))); }
  else if (st) { const r = st.r, dx = st.dir[0], dz = st.dir[1]; const f = dx ? [dx > 0 ? r[0] : r[2], (r[1] + r[3]) / 2] : [(r[0] + r[2]) / 2, dz > 0 ? r[1] : r[3]]; const t = dx ? [dx > 0 ? r[2] : r[0], f[1]] : [f[0], dz > 0 ? r[3] : r[1]];
    const fo = Sp.feet(st); const ff = Sp.doorFlight(b, d.p.shell, { w: b.w * TL, d: b.h * TL }, fo.w, fo.h, 0, false, fo.F, fo.uc); const far = ff && ff.treads.length ? Math.max(...ff.treads.map(q => q.n + q.wn / 2)) + 0.5 : 0.6;
    pts.push(Wd([f[0] - dx * far, f[1] - dz * far]), Wd([f[0] + dx * 0.1, f[1] + dz * 0.1]), Wd([t[0] - dx * 0.2, t[1] - dz * 0.2])); }
  else {
    const far = Math.max(1.4, fl && fl.treads.length ? Math.max(...fl.treads.map(q => q.n + q.wn / 2)) + 0.6 : 0);
    const lat = [-u[1], u[0]]; let a = 0;
    for (const a0 of [0, 0.25, -0.25, 0.45, -0.45, 0.6, -0.6]) { if (Math.abs(a0) > d.hw / 2 - 0.3 && a0) continue; let good = true;
      for (let s = 0.3; s <= far + 0.01 && good; s += 0.15) for (const e of [-0.36, 0, 0.36]) { const X = D[0] + u[0] * s + lat[0] * (a0 + e), Z = D[1] + u[1] * s + lat[1] * (a0 + e); if (!clearAt(X, Z)) { good = false; break; } }
      if (good) { a = a0; break; } }
    pts.push([D[0] + u[0] * far + lat[0] * a, D[1] + u[1] * far + lat[1] * a], [D[0] + u[0] * 0.3 + lat[0] * a, D[1] + u[1] * 0.3 + lat[1] * a]);
  }
  pts.push([D[0] - u[0] * 1.3, D[1] - u[1] * 1.3]); // (and in, a stride past the door)
  return pts;
}
// (the body put on a doorstep, a building's own: at e.out, the door as asked)
// (the door opened or shut by the hand of one who has its key: the body, for a moment the building's own)
const setDoor = (d, open) => god(() => { const own = v.home; v.home = d.b.id; const s0 = In.doorState(d.b, d.e.door).state;
  if (open) { if (s0 === 'trancada') In.useDoor(d.b, d.e.door, 'destrancar', v); if (In.doorState(d.b, d.e.door).state !== 'aberta') In.useDoor(d.b, d.e.door, 'abrir', v); }
  else if (s0 === 'aberta') In.useDoor(d.b, d.e.door, 'fechar', v);
  v.home = own; });
function bodyAt(d, open) {
  if (S.avatar) G.Possess.release('deus');
  god(() => { G.Vg.endTask(v); v.inside = 0; v.x = d.O[0] / TL; v.y = d.O[1] / TL; v.path = null; }); setDoor(d, open);
  if (!G.Possess.take(v).ok) return false; G.Avatar.attach(v, Math.atan2(d.D[1] - d.O[1], d.D[0] - d.O[0])); for (let k = 0; k < 6; k++) frame(); return true;
}
// (walking as a player holds the stick; every frame watched: a jump of the body's place it did not walk is the world's push —
// and, on the way in and out by the door, a climb with the hands: steps too high to walk up)
let pushes = 0, worst = 0; let last = null; let climbs = 0, inWay = false, wasClimb = false;
const pushedAt = [];
const watch = () => { const P = [v.x, v.y, v.inside]; if (last) { const j = Math.hypot(P[0] - last[0], P[1] - last[1]) * TL; if (j > 0.25) { pushes++; worst = Math.max(worst, j);
  if (pushedAt.length < 3) { const q = Sp.indoor(last[0] * TL, last[1] * TL); const B = S.buildings.get(S.occ[W.idx(last[0], last[1])]); pushedAt.push(`${j.toFixed(2)} m de ${last[0].toFixed(2)},${last[1].toFixed(2)} (dentro ${last[2] || 0}; ladrilho ${B ? B.type + '#' + B.id : '-'}; planta ${q ? `${q.b.type}#${q.b.id} walk ${q.walk} casca ${q.shell}` : '-'}; o mundo anda ${W.walkableXY(last[0], last[1])}) a ${P[0].toFixed(2)},${P[1].toFixed(2)} (dentro ${P[2] || 0})`); } } } last = P; };
const st = () => G.Avatar.state();
function walk(X, Z, max, stopIn) {
  let k = 0; for (; k < (max || 240); k++) { const s = st(); const dx = X - s.X, dz = Z - s.Z; if (Math.hypot(dx, dz) < 0.15 || (stopIn && v.inside)) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mx = 0; IN.mz = 1; s.yaw = yaw; frame(); watch();
    const c = st().loco === 'climb'; if (inWay && c && !wasClimb) climbs++; wasClimb = c; }
  IN.mz = 0; return k;
}
const pathTo = (X, Z) => { const p = W.findPath(v.x, v.y, X / TL, Z / TL, true, 30000); if (p) for (const w2 of p) walk(w2[0] * TL, w2[1] * TL, 200); };
// (in by the way in; out by it back)
// (the turn of the day puts the doors back to their rule — Interiors.onNewDay —: one that shut while the body was on its way is
// opened again before the stride through it, as a player does; counted)
let reopened = 0; const keepOpen = d => { if (In.doorState(d.b, d.e.door).state !== 'aberta') { reopened++; setDoor(d, true); } };
function goIn(d) { const pts = wayIn(d); pathTo(pts[0][0], pts[0][1]); inWay = true; for (const q of pts.slice(0, -1)) walk(q[0], q[1], 260); keepOpen(d); const q = pts[pts.length - 1]; walk(q[0], q[1], 260); inWay = false; for (let k = 0; k < 6; k++) { frame(); watch(); } return v.inside === d.b.id; }
function goOut(d) { const pts = wayIn(d).slice(0, -1).reverse(); keepOpen(d); inWay = true; for (const q of pts) walk(q[0], q[1], 260); walk(d.O[0], d.O[1], 260); inWay = false; for (let k = 0; k < 6; k++) { frame(); watch(); } return !v.inside; }
const houses = [...S.buildings.values()].filter(q => q.built && In.has(q) && (q.type === 'house' || q.type === 'sobrado') && In.planDoor(q)).sort((a, c) => a.id - c.id);

// ------------------------------ 1. standing on the doorstep ------------------------------
if (part(1)) { const rows = []; let tried = 0, moved = 0, still = 0, lost = 0; const bad = new Set(), redone = [];
  const houseNow = b => { const B = S.buildings.get(b.id); return B !== b ? 'derrubada' : !B.built ? `obra de ${B.type}` : B.ip ? `${B.type}, porta ${B.ip.s}:${B.ip.o}` : B.type; };
  for (const b of houses) {
    if (rows.length >= 25 || tried > 120) break; tried++;
    const d = door(b); if (!d || !bodyAt(d, true)) continue;
    // (in from the street until the feet are on the plan's ground the world's map has blocked, not yet within the walls)
    const pts = wayIn(d); let on = false; pathTo(pts[0][0], pts[0][1]);
    for (const q of pts) { for (let k = 0; k < 260 && !on; k++) { const s = st(); const dx = q[0] - s.X, dz = q[1] - s.Z; if (Math.hypot(dx, dz) < 0.15) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mz = 0.4; s.yaw = yaw; frame(); if (!v.inside && !W.walkableXY(v.x, v.y)) on = true; } if (on) break; }
    IN.mz = 0; if (!on) continue;
    // (the house as it stands: the world may remake it while the body is on its doorstep — the city raising a sobrado to an
    // insula in its place, a building site with no plan yet (Ci.upgradeHomes); the turn of the day moving its door (L-195) —:
    // the doorstep goes with it, and the world takes the body out as anyone (L-175). Such a house is set apart, from the step it
    // changed in: the body seen on ground the world walks once the push of the stuck — once a second — has come, the verifier
    // clean then — T-103)
    const x0 = v.x, y0 = v.y; last = null; let mv = 0; const was = houseNow(b); let remade = '';
    for (const open of [true, false]) {
      if (remade) break; if (!open) god(() => { In.useDoor(d.b, d.e.door, 'fechar', v); });
      for (let k = 0; k < 300; k++) { const pk = pushes, wk = worst; frame(); watch(); if (houseNow(b) !== was) { remade = houseNow(b); pushes = pk; worst = wk; break; }
        if (k % 10 === 0) for (const q of vbad()) bad.add(`S${q.sev} ${q.sys}: ${q.msg}`); }
      mv = Math.max(mv, Math.hypot(v.x - x0, v.y - y0) * TL);
    }
    if (remade) { const pk = pushes, wk = worst; for (let k = 0; k < 120; k++) { frame(); watch(); } pushes = pk; worst = wk; const q = vbad();
      const out = (W.walkableXY(v.x, v.y) || G.Possess.onPlan(v)) && !q.length; if (!out) lost++;
      redone.push(`${b.type}#${b.id} → ${remade}: o corpo ${out ? `no chão do mundo, a ${(Math.hypot(v.x - x0, v.y - y0) * TL).toFixed(2)} m` : `preso em ${v.x.toFixed(1)},${v.y.toFixed(1)}${q.length ? ' (' + vtxt(q) + ')' : ''}`}`); continue; }
    if (mv > 0.05) moved++; else still++;
    rows.push(`${b.type}#${b.id} ${mv.toFixed(2)} m`);
  }
  ok('1. parado 3,5 s do mundo na soleira de 25 casas, no chão que a planta anda e o mapa do mundo não, de porta aberta e de porta fechada: nunca movido; verificador limpo, S3 incluído; a casa que o mundo refaz no meio, à parte: o corpo tirado para o chão do mundo, como qualquer um', rows.length >= 25 && !moved && !pushes && !bad.size && !lost,
    `${rows.length} casas (${tried} olhadas): ${still} paradas, ${moved} movidas; empurrões ${pushes}${worst ? ` (até ${worst.toFixed(2)} m)` : ''}; ${bad.size ? [...bad].slice(0, 3).join(' · ') : 'verificador limpo'}; refeitas pelo mundo no meio ${redone.length}${redone.length ? ' (' + redone.slice(0, 3).join(' · ') + ')' : ''}; a regra antiga do qa.js acusou ${oldRule} vezes onde a planta deixa (Possess.onPlan)`);
}

// ------------------------------ 2. 50 times in and out ------------------------------
if (part(2)) { pushes = 0; worst = 0; reopened = 0; climbs = 0; let ins = 0, outs = 0, trips = 0; const used = [];
  for (const b of houses) {
    if (trips >= 50) break; const d = door(b); if (!d || !bodyAt(d, true)) continue; last = null;
    if (!goIn(d)) continue; ins++; if (!goOut(d)) continue; outs++; trips++; used.push(b.id);
    for (let k = 0; k < 9 && trips < 50; k++) { if (!goIn(d)) break; ins++; if (!goOut(d)) break; outs++; trips++; }
  }
  const bad = vbad();
  ok('2. 50 vezes dentro e fora pela porta, uma atrás da outra: nenhum empurrão, nenhum degrau escalado com as mãos; dentro a cada vez, fora a cada vez', trips >= 50 && !pushes && !climbs && ins === outs && !bad.length,
    `${trips} idas e voltas em ${used.length} casas (${used.slice(0, 6).join(', ')}…): ${ins} entradas, ${outs} saídas; empurrões ${pushes}${worst ? ` (até ${worst.toFixed(2)} m: ${pushedAt.join(' · ')})` : ''}; escaladas ${climbs}; ${vtxt(bad)}${reopened ? `; a porta voltou à regra no caminho ${reopened} ${reopened > 1 ? 'vezes' : 'vez'}, aberta de novo` : ''}`);
}

// ------------------------------ 3. every kind of store, its door open ------------------------------
const flights = [];
if (part(3)) { const kinds = {}; for (const b of [...S.buildings.values()].filter(q => q.built && In.has(q) && G.BDEF[q.type] && G.BDEF[q.type].dropoff && In.planDoor(q)).sort((a, c) => a.id - c.id)) (kinds[b.type] = kinds[b.type] || []).push(b);
  const rows = [], miss = []; let n = 0, got = 0; reopened = 0; climbs = 0; pushes = 0; pushedAt.length = 0;
  for (const [t, L] of Object.entries(kinds)) { let k = 0, kin = 0;
    for (const b of L.slice(0, 6)) { const d = door(b); if (!d || !bodyAt(d, true)) continue; k++; n++; last = null; const okIn = goIn(d); if (okIn) { kin++; got++; } else { const P = G.Avatar.pos(); miss.push(`${t}#${b.id} parou a ${Math.hypot(P.X - d.D[0], P.Z - d.D[1]).toFixed(2)} m (a porta ${In.doorState(b, d.e.door).state}, dia ${S.day} às ${S.time.toFixed(2)} do dia)`); }
      if (d.fl) flights.push({ b, fl: d.fl }); if (d.st) { const fo = Sp.feet(d.st); const ff = Sp.doorFlight(b, d.p.shell, { w: b.w * TL, d: b.h * TL }, fo.w, fo.h, 0, false, fo.F, fo.uc); if (ff) flights.push({ b, fl: ff }); } }
    rows.push(`${t} ${kin}/${k}`); }
  ok('3. cada tipo de depósito com planta, de porta aberta: o corpo entra da rua andando — pelos degraus da porta, ou pelos do pé da escada de fora, onde houver —, sem escalar nenhum', Object.keys(kinds).length >= 2 && got === n && n >= 6 && !climbs,
    `${rows.join(' · ')}${miss.length ? '; ' + miss.slice(0, 3).join(' · ') : ''}; escaladas ${climbs}; empurrões ${pushes}${pushedAt.length ? ` (${pushedAt.join(' · ')})` : ''}${reopened ? `; a porta voltou à regra no caminho ${reopened} ${reopened > 1 ? 'vezes' : 'vez'}, aberta de novo` : ''}`);
}

// ------------------------------ 4. the steps walked are the steps drawn ------------------------------
if (part(4)) { for (const b of houses.slice(0, 80)) { const d = door(b); if (d && d.fl && d.fl.treads.length > 1) flights.push({ b, fl: d.fl }); if (flights.length > 40) break; }
  let n = 0, floor = 0, drawn = 0; const bad = [];
  for (const { b, fl } of flights.slice(0, 30)) {
    const y0 = Sp.plinth(b).y0; const L = 16; const cx = Math.floor(b.x / L) * L, cy = Math.floor(b.y / L) * L; // (the chunk that draws it: its corner's)
    const g = B3.nearGeo(cx, cy, L).solid; const P = g && g.attributes ? g.attributes.position.array : [];
    for (const t of fl.treads) {
      n++; const c = fl.P(t.a, t.n); const X = b.x * TL + c[0], Z = b.y * TL + c[1];
      // (the feet over the tread's middle: the floor the body stands on there — the plan's on the lot, the steps' in the street)
      const f = G.Avatar.floorAt(X, Z); if (Math.abs(f - (y0 + t.y + Sp.FLOOR_UP)) < 0.02) floor++; else if (bad.length < 4) bad.push(`${b.type}#${b.id} degrau ${t.kind}${t.k}: o chão ${f.toFixed(2)}, o degrau ${(y0 + t.y).toFixed(2)}`);
      // (and the drawing: points at the tread's top over its footprint)
      let k = 0; const hx = (fl.F.ax ? t.wa : t.wn) / 2 + 0.03, hz = (fl.F.ax ? t.wn : t.wa) / 2 + 0.03;
      for (let i = 0; i < P.length && k < 4; i += 3) if (Math.abs(P[i + 1] - (y0 + t.y)) < 0.012 && Math.abs(P[i] - X) <= hx && Math.abs(P[i + 2] - Z) <= hz) k++;
      if (k >= 4) drawn++; else if (bad.length < 4) bad.push(`${b.type}#${b.id} degrau ${t.kind}${t.k}: ${k} pontos desenhados no topo`);
    }
  }
  ok('4. os degraus que os pés sobem são os que o 3D assenta: sobre cada um, o chão do corpo é o topo dele, e o desenho tem uma face ali', n >= 20 && floor === n && drawn === n, `${n} degraus de ${Math.min(30, flights.length)} lances: chão certo em ${floor}, desenhados em ${drawn}${bad.length ? '; ' + bad.join(' · ') : ''}`);
  // (and every flight before an outer door, and before the foot of an outside flight, in all the world, where the world says the
  // way in fits, walked up (T-090, T-102): the body put on the ground before its foot and led up it to the door, as a player
  // holds the stick — with the world stopped: only the body moves —; on the top one at the end, nothing climbed with the hands. Beside it, as a
  // number only, the step measured from the ground a stride past the foot to the lowest tread with the rise above it, against
  // Avatar.TUNE.stepUp: on a steep slope that ground is lower than the ground the feet step up from, and it says more than the
  // body finds)
  const UP = G.Avatar.TUNE.stepUp; let nf = 0, hi = 0, nw = 0, up1 = 0, noFoot = 0, maxRise = 0; const far = [], stops = [];
  let nNo = 0, upNo = 0, footNo = 0; const left = [];
  const inShell = (sh, q) => { const cx = (q.r[0] + q.r[2]) / 2, cz = (q.r[1] + q.r[3]) / 2; return sh.kind === 'round' ? Math.hypot(cx - sh.cx, cz - sh.cz) < sh.r : cx > sh.r[0] && cx < sh.r[2] && cz > sh.r[1] && cz < sh.r[3]; };
  const still = () => G.Avatar.frame(RDT);
  const walkStill = (X, Z, max) => { let stuck = 0, hiY = -1e9, hands = false; let lastP = [st().X, st().Z];
    for (let k = 0; k < max; k++) { const s = st(); const dx = X - s.X, dz = Z - s.Z; if (Math.hypot(dx, dz) < 0.15) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mx = 0; IN.mz = 1; IN.run = false; s.yaw = yaw; still();
      hiY = Math.max(hiY, st().Y); if (st().loco === 'climb') hands = true;
      if (Math.hypot(st().X - lastP[0], st().Z - lastP[1]) < 0.002) { if (++stuck > 15) break; } else stuck = 0; lastP = [st().X, st().Z]; }
    IN.mz = 0; return { hiY, hands }; };
  // (the body on a point of the world — metres —, facing a way: put there by the god's hand, lived again, a few frames)
  const putAt = (X, Z, yaw) => { if (S.avatar) G.Possess.release('deus'); god(() => { G.Vg.endTask(v); v.inside = 0; v.x = X / TL; v.y = Z / TL; v.path = null; });
    if (!G.Possess.take(v).ok) return false; G.Avatar.attach(v, yaw); for (let k = 0; k < 4; k++) still(); return true; };
  for (const b of [...S.buildings.values()].filter(q => q.built && In.has(q)).sort((a, c) => a.id - c.id)) {
    const p = Sp.planNow(b); if (!p || !p.ok) continue; const y0 = Sp.plinth(b).y0; const lot = { w: b.w * TL, d: b.h * TL }; const fls = [];
    for (const h of p.holes) { const dd = h.door >= 0 ? p.doors[h.door] : null; if (!dd || !dd.outer || h.kind === 'janela') continue; const w = p.walls[h.wall]; if (!w) continue; const l = p.levels.find(q => q.lv === w.lv); fls.push([Sp.doorFlight(b, p.shell, lot, w, h, l ? l.y : 0, raisedOf(p)), true]); }
    for (const q of p.stairs) if (q.kind === 'degraus') { const fo = Sp.feet(q); fls.push([Sp.doorFlight(b, p.shell, lot, fo.w, fo.h, 0, false, fo.F, fo.uc), !inShell(p.shell, q)]); }
    for (const [fl, outside] of fls) { if (!fl || !fl.treads.length) continue; nf++;
      const T = fl.treads.slice().sort((a, c) => a.y - c.y); const lo = T[0], up = T[1]; const sg = lo.kind === 'side' ? Math.sign(lo.a) : 0;
      for (let k = 1; k < T.length; k++) maxRise = Math.max(maxRise, T[k].y - T[k - 1].y);
      const P = sg ? fl.P(lo.a + sg * (lo.wa / 2 + 0.12), lo.n) : fl.P(lo.a, lo.n + lo.wn / 2 + 0.12); const gx = Math.min(G.N - 0.001, b.x + P[0] / TL), gz = Math.min(G.N - 0.001, b.y + P[1] / TL);
      const foot = lo.y - (Math.max(Sp.drawnAt(gx, gz), Sp.deckAt(gx, gz)) - y0), rise = up ? up.y - lo.y : 0;
      if (foot + rise > UP + 1e-6) { hi++; if (far.length < 4) far.push(`${b.type}#${b.id}: ${foot.toFixed(2)} + ${rise.toFixed(2)} m`); }
      if (!outside) continue; // (the steps down into a sunken floor, inside the walls, are the plan's own)
      // (the way up as a player takes it, as wayIn does for a door: up a side flight from before its lowest tread — along the
      // wall beyond it the lot's plinth stands — over each of its treads to the door; else straight up the flight's line from a
      // stride past its foot to its top, and there to the door's middle — a flight to one side of the door ends beside its
      // opening —: the body ends against the door, shut, or in its opening)
      // (from the ground a stride before the lowest tread — where the world looks for it, Space.doorFlight's ground —)
      const Wd = q => [b.x * TL + q[0], b.y * TL + q[1]]; const side = T.filter(t => t.kind === 'side'); const pts = [Wd(fl.P(lo.a, lo.n + lo.wn / 2 + 0.5))];
      if (side.length) { for (const t of side) pts.push(Wd(fl.P(t.a, t.n))); pts.push(Wd(fl.P(0, 0.3)), Wd(fl.P(0, 0))); } // (by the landing: not aslant into the wall)
      else pts.push(Wd(fl.P(lo.a, 0.3)), Wd(fl.P(0, 0.3)), Wd(fl.P(0, 0)));
      // (the world's own word on these steps — what Space.entryFits answers for a door's way in, L-195, L-207 —: their feet walk,
      // there is ground a stride before their foot, and the body stands on each tread of its way. Where it says no, the door is
      // the world's to move, at the turn of the day, to a side where the way in fits — or to keep, where none fits —: walked
      // all the same, and counted apart, with the side the world would take — T-102)
      const fits = fl.walks && fl.ground && fl.stand;
      const s0 = pts[0], c0 = pts[1];
      if (!putAt(s0[0], s0[1], Math.atan2(c0[1] - s0[1], c0[0] - s0[0]))) { if (fits) noFoot++; else footNo++; continue; } if (fits) nw++; else nNo++;
      // (each leg walked until the body is there or stops — fifteen frames without a step —: the frames are only a net, as many
      // as the leg is long, for the body the world gives after the proofs before, tired and hungry, slower — T-113)
      let hiY = st().Y, hands = false; for (const c of pts.slice(1)) { const leg = Math.hypot(c[0] - st().X, c[1] - st().Z); const r = walkStill(c[0], c[1], Math.min(1200, Math.ceil(200 + 60 * leg))); hiY = Math.max(hiY, r.hiY); hands = hands || r.hands; }
      // (up, and at the door: the height of the top tread reached at the flight's end is not the door reached — a landing over a
      // wall, over a cliff — T-102)
      const D = Wd(fl.P(0, 0)), dD = Math.hypot(st().X - D[0], st().Z - D[1]); const got = hiY - y0 >= fl.top - 0.05 && !hands && dD < 0.45;
      const how = () => `${b.type}#${b.id}: até ${(hiY - y0).toFixed(2)} m de ${fl.top.toFixed(2)}${hands ? ', com as mãos' : ''}${dD < 0.45 ? '' : `, parou a ${dD.toFixed(2)} m da porta${st().block ? ` (${st().block})` : ''}`} (${T.length} degraus)`;
      if (fits) { if (got) up1++; else if (stops.length < 4) stops.push(how()); }
      else if (got) upNo++;
      else if (left.length < 4) { const to = b.ip ? In.fitSide(b) : null; left.push(`${how()}, ${[!fl.walks && 'os pés não sobem', !fl.ground && 'sem chão diante do pé', !fl.stand && 'o corpo não pisa'].filter(Boolean).join(', ')}: ${!to ? 'não cabe em lado nenhum, a porta fica (L-195)' : to.s !== b.ip.s ? `cabe do lado ${to.s}, para onde a virada do dia a leva` : `a entrada cabe do lado ${to.s}, o dela`}`); } }
  }
  ok('4b. cada lance diante de uma porta de fora, em todo o mundo, onde o mundo diz que a entrada cabe: subido andando, do chão a um passo do pé até a porta, em cima, sem as mãos', nw >= 60 && up1 === nw && !noFoot,
    `${nw} lances subidos: ${up1} até a porta${stops.length ? ' — PAROU: ' + stops.join(' · ') : ''}; sem chão a um passo do pé ${noFoot}; à parte, onde o mundo diz que não cabe: ${nNo + footNo} (${upNo} subidos assim mesmo; ${footNo} sem chão diante do pé${left.length ? '; ' + left.join(' · ') : ''}); o degrau mais alto ${maxRise.toFixed(2)} m; ${nf} lances ao todo, ${hi} acima de um passo pela medida parada${far.length ? ' (' + far.join(' · ') + ')' : ''}`);
  if (S.avatar) G.Possess.release('deus');
  // (and a door moved to the other side of its shell — a reform, the day's turn, L-195 — with the same wall id and the same place
  // along it: the flight is the new side's, not the one kept for the old side — L-196)
  { let got = null;
    for (const b of houses) { const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance || p.shell.kind === 'round') continue; const h = p.holes.find(q => q.door === p.entrance.door && q.kind !== 'janela'); const w = h && p.walls[h.wall]; if (!w) continue;
      const l = p.levels.find(q => q.lv === w.lv), ly = l ? l.y : 0, lot = { w: b.w * TL, d: b.h * TL }; const fl = Sp.doorFlight(b, p.shell, lot, w, h, ly, raisedOf(p)); if (!fl || !fl.treads.length) continue;
      // (the same wall mirrored through the middle of the shell: on the opposite side)
      const r = p.shell.r, mx = r[0] + r[2], mz = r[1] + r[3]; const w2 = Object.assign({}, w, { a: [mx - w.a[0], mz - w.a[1]], b: [mx - w.b[0], mz - w.b[1]] });
      const kept = Sp.doorFlight(b, p.shell, lot, w2, h, ly, raisedOf(p)), anew = Sp.doorFlight(b, p.shell, lot, w2, h, ly, raisedOf(p), undefined, undefined, true);
      got = { b, side: fl.F.sd, kept: kept ? kept.F.sd : '-', anew: anew ? anew.F.sd : '-' }; break; }
    ok('4c. a porta mudada para o outro lado da casca, com o mesmo id de parede e o mesmo lugar nela: o lance é o do lado novo, não o guardado do velho', !!got && got.kept === got.anew && got.anew !== got.side,
      got ? `${got.b.type}#${got.b.id}: o lado de antes ${got.side}; o novo, como os pés o leem ${got.kept}, refeito ${got.anew}` : 'nenhuma casa com lance na entrada');
  }
  // (and a grown tree in the way of the steps that run on into the street before a door — L-197 —, the god's hand planting one
  // halfway down them, on their line, or beside it, its trunk over the edge of their treads: the steps never stand in its trunk.
  // Beside the line they go round it — narrower, or to the other side of the door's middle — and the body walks up them without
  // the hands (at one door at least: the street must have room for it); on it they stop short of it — the steps of the lot only:
  // an entrance that does not fit, Space.entryFits — or go round it. Wherever their foot walks, as the steps say, the body goes
  // up them without the hands. The tree taken away: the steps as they were; and what the 3D draws them again for,
  // Space.treeSig, moved with the tree and back)
  { const Nat = G.Nature; const recs = [];
    const flightOf = (b, p, w, h, ly) => Sp.doorFlight(b, p.shell, { w: b.w * TL, d: b.h * TL }, w, h, ly, raisedOf(p));
    const inTrunk = (fl, b, t) => { const R = Sp.trunk(t); const X = t.x * TL - b.x * TL, Z = t.y * TL - b.y * TL; const F = fl.F; const ta = (F.ax ? X : Z) - fl.uc, tn = ((F.ax ? Z : X) - F.line) * (F.ax ? F.o[1] : F.o[0]);
      return fl.treads.filter(q => Math.hypot(Math.max(q.a - q.wa / 2 - ta, 0, ta - (q.a + q.wa / 2)), Math.max(q.n - q.wn / 2 - tn, 0, tn - (q.n + q.wn / 2))) < R).length; };
    const look = fl => fl.treads.map(t => `${t.a.toFixed(2)},${t.n.toFixed(2)},${t.y.toFixed(2)},${t.wa.toFixed(2)}`).join(' ');
    // (up them as the 4b walks them: from a stride past the foot up the line to the top, there to the door's middle; up, and at
    // the door — T-102)
    const climb = (b, fl) => { const T2 = fl.treads.slice().sort((a, c) => a.y - c.y), lo = T2[0]; const Wd = z => [b.x * TL + z[0], b.y * TL + z[1]];
      const s = Wd(fl.P(lo.a, lo.n + lo.wn / 2 + 0.5)), pts = [Wd(fl.P(lo.a, 0.3)), Wd(fl.P(0, 0.3)), Wd(fl.P(0, 0))];
      if (!putAt(s[0], s[1], Math.atan2(pts[0][1] - s[1], pts[0][0] - s[0]))) return 'sem chão diante do pé';
      let hiY = -1e9, hands = false; for (const c of pts) { const leg = Math.hypot(c[0] - st().X, c[1] - st().Z); const r = walkStill(c[0], c[1], Math.min(1200, Math.ceil(200 + 60 * leg))); hiY = Math.max(hiY, r.hiY); hands = hands || r.hands; }
      const D = pts[2], at = Math.hypot(st().X - D[0], st().Z - D[1]) < 0.45;
      return hands ? 'com as mãos' : hiY - Sp.plinth(b).y0 >= fl.top - 0.05 && at ? 'subido' : 'parou'; };
    const R1 = Sp.trunk({ stage: 'grow', size: 1 }); // (an oak of size 1: its trunk 0.6 m round)
    for (const b of houses) { if (recs.length >= 6) break;
      const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance) continue; const h = p.holes.find(q => q.door === p.entrance.door && q.kind !== 'janela'); const w = h && p.walls[h.wall]; if (!w) continue;
      const l = p.levels.find(q => q.lv === w.lv), ly = l ? l.y : 0; const fl = flightOf(b, p, w, h, ly);
      // (straight out of the door's middle, a tile and more into the street, its foot walked)
      if (!fl || !fl.walks || !fl.ground || fl.treads.some(t => t.kind !== 'out' || Math.abs(t.a) > 0.01)) continue;
      const far = fl.treads.filter(t => t.n > fl.room + 0.3); if (far.length < 3) continue; const mid = far[Math.floor(far.length / 2)];
      const before = look(fl), ts0 = Sp.treeSig(b);
      // (on the line; beside it, just past the narrowest steps the street may take — a metre wide —, over the edge of these)
      for (const [where, a] of [['na linha', 0], ['ao lado', 0.5 + R1 + 0.02], ['ao lado', -(0.5 + R1 + 0.02)]]) {
        if (where === 'ao lado' && recs.some(r => r.b === b && r.where === 'ao lado')) continue;
        const q = fl.P(a, mid.n); const tr = god(() => Nat.addTree(b.x + q[0] / TL, b.y + q[1] / TL, 'oak', 1.0)); if (!tr) continue;
        const old = inTrunk(fl, b, tr); if (!old) { god(() => Nat.removeTree(tr)); continue; } // (beside treads narrower than that: not in their way)
        const fl2 = flightOf(b, p, w, h, ly); const ts1 = Sp.treeSig(b);
        const r = { b, where, n0: fl.treads.length, n2: fl2.treads.length, old, through: inTrunk(fl2, b, tr), walks: fl2.walks && fl2.ground, round: fl2.treads.some(t => t.n > fl.room + 0.3) };
        r.how = r.walks ? climb(b, fl2) : 'não cabe'; if (S.avatar) G.Possess.release('deus');
        god(() => Nat.removeTree(tr)); r.back = look(flightOf(b, p, w, h, ly)) === before; r.sig = ts1 !== ts0 && Sp.treeSig(b) === ts0; recs.push(r); }
    }
    const line = recs.filter(r => r.where === 'na linha'), side = recs.filter(r => r.where === 'ao lado');
    const good = r => !r.through && r.back && r.sig && (!r.walks || r.how === 'subido');
    ok('4d. uma árvore crescida no caminho dos degraus que entram na rua: nunca o tronco num degrau; ao lado da linha deles, eles a contornam e o corpo os sobe sem as mãos; na linha, param antes ou a contornam; onde o pé deles anda, o corpo os sobe sem as mãos; sem a árvore, os degraus de antes, e o 3D os refaz com ela e sem ela',
      line.length >= 1 && side.length >= 1 && recs.every(good) && side.some(r => r.walks && r.how === 'subido'),
      recs.length ? recs.map(r => `${r.b.type}#${r.b.id} ${r.where}: ${r.n0} degraus sem ela (${r.old} no tronco), ${r.n2} com ela, ${r.through} no tronco, ${r.walks ? (r.round ? 'contornam, ' : 'no lote, ') + r.how : 'param antes (não cabe)'}${r.back ? '' : ', sem ela OUTROS'}${r.sig ? '' : ', a assinatura das árvores não seguiu'}`).join(' · ') : 'nenhuma casa com degraus na rua');
  }
  // (and the street before such a door taken — the ground of a building where the steps ran on into it, the world told:
  // W.touchWalk —: the steps reckoned anew from that ground, the 3D's and the feet's — none left standing on the other's lot —,
  // and the ones of before when the street is open again (L-213: the memo kept the old ones over a street built over, and
  // Space.stepTop gave the feet their tops inside the new lot))
  { const recs = []; const blocker = [...S.buildings.values()].filter(q => q.built && q.blocks).sort((a, c) => a.id - c.id)[0];
    const look = fl => (fl ? fl.treads.map(t => `${t.a.toFixed(2)},${t.n.toFixed(2)},${t.y.toFixed(2)},${t.wa.toFixed(2)}`).join(' ') : '-');
    for (const b of houses) { if (recs.length >= 3 || !blocker) break;
      const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance) continue; const h = p.holes.find(q => q.door === p.entrance.door && q.kind !== 'janela'); const w = h && p.walls[h.wall]; if (!w) continue;
      const l = p.levels.find(q => q.lv === w.lv), ly = l ? l.y : 0, lot = { w: b.w * TL, d: b.h * TL }; const fl = Sp.doorFlight(b, p.shell, lot, w, h, ly, raisedOf(p));
      if (!fl || !fl.walks || !fl.ground || fl.treads.some(t => t.kind !== 'out')) continue;
      const far = fl.treads.filter(t => t.n > fl.room + 0.3); if (far.length < 2) continue;
      const t = far[far.length - 1]; const q = fl.P(t.a, t.n); const X = b.x * TL + q[0], Z = b.y * TL + q[1]; const i = W.idx(X / TL, Z / TL);
      if (S.occ[i] || !W.walkable(i)) continue;
      const before = look(fl), sig0 = Sp.treeSig(b), top0 = Sp.stepTop(X, Z);
      god(() => { S.occ[i] = blocker.id; W.touchWalk(); });
      const kept = Sp.doorFlight(b, p.shell, lot, w, h, ly, raisedOf(p)), anew = Sp.doorFlight(b, p.shell, lot, w, h, ly, raisedOf(p), undefined, undefined, true);
      const top1 = Sp.stepTop(X, Z), sig1 = Sp.treeSig(b);
      god(() => { S.occ[i] = 0; W.touchWalk(); });
      const back = look(Sp.doorFlight(b, p.shell, lot, w, h, ly, raisedOf(p))) === before;
      recs.push({ b, n0: fl.treads.length, n1: kept ? kept.treads.length : 0, same: look(kept) === look(anew), top0, top1, sig: sig1 !== sig0 && Sp.treeSig(b) === sig0, back });
    }
    ok('4e. a rua diante da porta tomada (o chão de um prédio onde os degraus entravam nela): os degraus refeitos daquele chão, os do 3D e os dos pés — nenhum no lote do outro —; a rua de volta, os de antes',
      recs.length >= 1 && recs.every(r => r.same && r.top1 === -Infinity && r.sig && r.back),
      recs.length ? recs.map(r => `${r.b.type}#${r.b.id}: ${r.n0} degraus com a rua aberta, ${r.n1} com ela tomada (${r.same ? 'refeitos' : 'OS DE ANTES, guardados'}); o pé no último degrau de antes: ${r.top0.toFixed(2)} → ${r.top1 === -Infinity ? 'nenhum degrau' : r.top1.toFixed(2)}${r.sig ? '' : '; a assinatura da rua não seguiu'}${r.back ? '' : '; com a rua de volta, OUTROS'}`).join(' · ') : 'nenhuma casa com degraus na rua');
  }
}

// ------------------------------ 5. saved and loaded on a doorstep ------------------------------
if (part(5)) { let d = null, on = false;
  for (const b of houses.slice(0, 60)) { d = door(b); if (!d || !bodyAt(d, true)) continue; const pts = wayIn(d); pathTo(pts[0][0], pts[0][1]);
    for (const q of pts) { for (let k = 0; k < 260 && !on; k++) { const s = st(); const dx = q[0] - s.X, dz = q[1] - s.Z; if (Math.hypot(dx, dz) < 0.15) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mz = 0.4; s.yaw = yaw; frame(); if (!v.inside && !W.walkableXY(v.x, v.y)) on = true; } if (on) break; }
    IN.mz = 0; if (on) break; }
  // (a step further onto it, short of the door: not on its edge with the street)
  if (on) { for (let k = 0; k < 5 && !v.inside; k++) { const s = st(); const yaw = Math.atan2(d.D[1] - s.Z, d.D[0] - s.X); IN.camYaw = yaw; IN.mz = 0.3; s.yaw = yaw; frame(); } IN.mz = 0; for (let k = 0; k < 4; k++) frame(); on = !v.inside && !W.walkableXY(v.x, v.y); }
  const x0 = v.x, y0 = v.y; M.salvarCarregar(); S = G.S; v = G.Possess.body(); let afl = null, mv = -1, onP = false;
  let at = '';
  if (v) { afl = !!(v.task && v.task.afloat); G.Avatar.attach(v, 0); last = null; pushes = 0; for (let k = 0; k < 300; k++) { frame(); watch(); } mv = Math.hypot(v.x - x0, v.y - y0) * TL; onP = G.Possess.onPlan(v);
    const q = Sp.indoor(v.x * TL, v.y * TL); at = q ? `(planta: walk ${q.walk}, casca ${q.shell}, célula ${q.code}; dentro ${v.inside})` : '(fora de qualquer planta)'; }
  const bad = vbad();
  ok('5. salvo e carregado de pé numa soleira: lá ainda, sem ser movido, sem a marca de quem nada; o corpo onde a planta deixa ficar', on && !!v && v.id === vid && !afl && mv >= 0 && mv < 0.05 && onP && !pushes && !bad.length,
    `${d ? `${d.b.type}#${d.b.id}` : '-'}: ${on ? 'na soleira' : 'não chegou à soleira'}; depois de carregar: ${v ? `${afl ? 'com' : 'sem'} a marca de quem nada, movido ${mv.toFixed(2)} m em 3,5 s, ${onP ? 'onde a planta deixa' : 'fora da planta'} ${at}` : 'sem corpo'}; ${vtxt(bad)}`);
}

// ------------------------------ 6. walls that rose round the body; a save a step into a room ------------------------------
if (part(6)) {
  // (a house built where the body stands, on the open ground of a town: the walls rose round it, it came in by no door —
  // Possess.cameBy —; the world takes it out as anyone, to the nearest ground it walks, or it stays on the new house's
  // doorstep, which the plan walks: never inside, never in its rooms. The body put on open ground among the houses — a tile of
  // nobody's whose eight round it are nobody's too, not in a field's or a square's ground —, as a house is put on free ground)
  const free = (x, y) => W.inb(x, y) && !S.occ[W.idx(x, y)] && W.walkable(W.idx(x, y)) && ![...S.buildings.values()].some(b => x >= b.x - 1 && x <= b.x + b.w && y >= b.y - 1 && y <= b.y + b.h);
  const spots = []; for (const b0 of houses) { if (spots.length >= 8) break; const b = S.buildings.get(b0.id); if (!b) continue;
    for (let r = 2; r <= 6 && spots.length < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const x = b.x + dx, y = b.y + dy;
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== r || spots.some(q => Math.abs(q[0] - x) < 6 && Math.abs(q[1] - y) < 6)) continue;
      let ok8 = true; for (let ey = -1; ey <= 1 && ok8; ey++) for (let ex = -1; ex <= 1; ex++) if (!free(x + ex, y + ey)) { ok8 = false; break; } if (ok8 && spots.length < 8) spots.push([x, y, b.set]); } }
  const rows = [], made = []; let n = 0, inside = 0, walled = 0, lost = 0; const bad = new Set();
  for (const [x, y, set] of spots) {
    if (n >= 6) break; if (S.avatar) G.Possess.release('deus');
    god(() => { G.Vg.endTask(v); v.inside = 0; v.x = x + 0.5; v.y = y + 0.5; v.path = null; });
    if (!G.Possess.take(v).ok) continue; G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame(); if (Math.floor(v.x) !== x || Math.floor(v.y) !== y) continue;
    const nb = god(() => G.Village.addBuilding('house', x, y, set, true)); if (!nb) continue; n++; // (of the town of the house beside it)
    for (let k = 0; k < 90; k++) frame(); for (const q of vbad()) bad.add(`S${q.sev} ${q.sys}: ${q.msg}`); // (the world's push, once a second: then the verifier)
    const q = Sp.indoor(v.x * TL, v.y * TL); const inWalls = !v.inside && !!q && q.b === nb && q.shell;
    if (v.inside === nb.id) inside++; if (inWalls) walled++; if (!S.avatar || S.avatar.id !== v.id) lost++;
    rows.push(v.inside === nb.id ? 'dentro' : inWalls ? 'nas paredes' : W.walkableXY(v.x, v.y) ? 'no chão do mundo' : G.Possess.onPlan(v) ? 'na soleira da casa nova' : 'preso'); made.push(`${nb.id}@${nb.x},${nb.y}`);
    god(() => { if (v.inside === nb.id) { const dd = G.Vg.door(nb); v.x = dd[0]; v.y = dd[1]; v.inside = 0; } G.Village.removeBuilding(nb); });
  }
  const tally = {}; for (const r of rows) tally[r] = (tally[r] || 0) + 1;
  ok('6. um prédio nasce onde o corpo está: o corpo não fica dentro nem nos cômodos — não entrou por porta nenhuma —; o mundo o tira como a qualquer um', n >= 4 && !inside && !walled && !lost && !bad.size && rows.every(r => r === 'no chão do mundo' || r === 'na soleira da casa nova'),
    `${n} casas nascidas sobre o corpo (${made.join(' ')}): ${Object.entries(tally).map(([k, c]) => `${c} ${k}`).join(', ')}; ${bad.size ? [...bad].slice(0, 2).join(' · ') : 'verificador limpo'}`);
  // (a save in a door's opening, the body walking in: within the walls, the world not yet having it indoors — its word for it
  // goes in the next step —; loaded, it stands there, not one who swims, and the world has it indoors by the door it came in by)
  let d = null, got = false, x0 = 0, y0 = 0, B = null;
  for (const b0 of houses.slice(0, 40)) { const b = S.buildings.get(b0.id); if (!b) continue; d = door(b); if (!d || !bodyAt(d, true)) continue; const pts = wayIn(d); pathTo(pts[0][0], pts[0][1]);
    for (const q of pts) { for (let k = 0; k < 260 && !got; k++) { const s = st(); const dx = q[0] - s.X, dz = q[1] - s.Z; if (Math.hypot(dx, dz) < 0.15) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mx = 0; IN.mz = 1; s.yaw = yaw; frame();
        const ins = Sp.indoor(s.X, s.Z); if (ins && ins.b === b && ins.shell && ins.walk && ins.door >= 0 && !v.inside) got = true; } if (got) break; }
    IN.mz = 0; if (got) { B = b; break; } }
  let w = null, afl = null, mv = -1, via = 0, inn = 0; const bad2 = [];
  if (got) { x0 = v.x; y0 = v.y; via = S.avatar.via; M.salvarCarregar(); S = G.S; w = G.Possess.body();
    if (w) { v = w; afl = !!(w.task && w.task.afloat); mv = Math.hypot(w.x - x0, w.y - y0) * TL; G.Avatar.attach(w, 0); for (let k = 0; k < 10; k++) frame(); inn = w.inside; bad2.push(...vbad()); } }
  ok('6. salvo e carregado no vão da porta, entrando, antes de o mundo o ter dentro: lá ainda, sem a marca de quem nada; o mundo o tem dentro pela porta por onde veio', got && via === (B && B.id) && !!w && !afl && mv >= 0 && mv < 0.05 && B && inn === B.id && !bad2.length,
    `${B ? `${B.type}#${B.id}` : 'nenhuma casa'}: ${got ? `entrando (vindo pela porta de ${via || '-'})` : 'não achou a janela'}; depois de carregar: ${w ? `${afl ? 'com' : 'sem'} a marca de quem nada, movido ${mv.toFixed(2)} m, dentro de ${inn || '-'} 10 quadros depois` : 'sem corpo'}; ${vtxt(bad2)}`);
}

// (no module error)
ok('módulos', JSON.stringify(G.modErr) === '{}', `${JSON.stringify(G.modErr)}; S3 do próprio mundo, à parte (vêm também sem corpo nenhum): ${world3.size} acusações de ${world3who.size} ${world3who.size === 1 ? 'pessoa' : 'pessoas'}${world3.size ? ' — ' + [...world3].slice(0, 2).join(' · ') : ''}`);
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
