// porta: at a door it is the door one means — in Node, without a browser (the simulation of qa/nodemundo.js with the body's
// files after it, as qa/visual/corpo-casa.js):
//   node qa/visual/porta.js [mundo]       (default: the ready world «metropole»)
// (in the browser — e18 — the dog of a yard won over the door of its house: «Fazer carinho no cão» where one meant «Abrir a
// porta». The door was out of reach from its own doorstep — Interiors.planDoor, where the world's people stand to go in, up
// to two metres out —, and an animal going by could win over a door by being near alone)
// The proofs:
//   1. on the doorstep of a house with a plan, whichever way the body faces — save with the door behind its back —, «E — Abrir a
//      porta»
//   2. E there: the body steps up to the door, the hands open it (the world in its step), and in it goes
//   3. the rule, around the door: an animal put at many places about the body — near and far, before it and to the side —, the
//      body on the doorstep and a step from the door, facing the door or not: the prompt is the animal exactly when the body
//      faces it more than the door (by more than a few degrees: Interact.AHEAD) and it is the nearer; else the door
//   4. away from any door, an animal before the body is still there to pet
//   5. someone else's locked door, from its doorstep: «Bater à porta» — the body steps up to it to knock, the door stays locked
//   5b. on every doorstep in the water (a canal, a ford: the water offers a fish a stride before the body, wherever it looks),
//      and a little behind it, facing the door: the door's own verb, not the fish (L-326); turned from it past Interact.FACE,
//      the fish again
//   and the verifier clean, no module error
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | porta ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'metropole');
const S = G.S, W = G.W, TL = G.Space.TILE, In = G.Interiors, Sp = G.Space, I = G.Interact;
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const still = n => { for (let k = 0; k < (n || 2); k++) G.Avatar.frame(RDT); }; // (the world stopped: only the body)
const god = f => { G.inSim++; const r = f(); G.inSim--; return r; };
const IN = G.Avatar.input; const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg));
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const said = []; G.IncUI = G.IncUI || {}; G.IncUI.toast = t => { said.push(t); }; // (the words the hands' acts say: no HUD in Node)
const deg = r => Math.round(r * 57.2958);

// ------------------------------ the house, the body ------------------------------
// (a house with a plan whose door is on a street, and a grown-up of it who can be lived — as the e18 of qa/encarna.js —; one the
// city will not rebuild while the proof runs, the farthest from its town's middle: the city densifies from its heart out
// (City.upgradeHomes), and the house#2924 of the new metropole, the nearest, was made a sobrado in the middle of the proof — T-156)
const adults = f => [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok && (!f || f(o)));
const outer = q => { const t = S.settlements.get(q.set); return t ? G.dist(q.x + 0.5, q.y + 0.5, t.cx, t.cy) : 0; }; // (how far from its town's middle)
let H = null;
for (const b of [...S.buildings.values()].filter(q => q.built && In.has(q) && (q.type === 'house' || q.type === 'sobrado') && In.planDoor(q)).sort((a, c) => outer(c) - outer(a) || a.id - c.id)) {
  const p = Sp.planNow(b); if (!p || !p.entrance || !p.entrance.out) continue;
  const v = adults(o => o.home === b.id && !o.sleeping).sort((a, c) => a.id - c.id)[0]; if (v) { H = { b, p, v }; break; }
}
if (!H) { ok('uma casa com planta e morador', false, '-'); process.exit(1); }
const { b, p, v } = H; const e = p.entrance; const step0 = In.planDoor(b);
god(() => { G.Vg.endTask(v); v.inside = 0; v.x = step0[0]; v.y = step0[1]; v.path = null; });
if (!G.Possess.take(v).ok) { ok('encarnar o morador', false, v.name); process.exit(1); }
G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame();
const st = G.Avatar.state();
// (the door as the prompt aims at it — the point of its wall —, and the doorstep: metres)
const doorT = () => { const ctx = I.ctx(); const pp = I.list.find(q => q.id === 'portaPlanta'); return (pp.find(ctx) || []).find(t => t.b === b && t.d.id === e.door) || null; };
const DT = doorT(); const DX = DT ? DT.X : 0, DZ = DT ? DT.Z : 0; const SX = b.x * TL + e.out[0], SZ = b.y * TL + e.out[1];
const out = Math.hypot(SX - DX, SZ - DZ); const ux = (SX - DX) / (out || 1), uz = (SZ - DZ) / (out || 1); // (outward from the door)
console.log(`(${b.type}#${b.id} ${b.style} ${p.fam}: a soleira a ${out.toFixed(2)} m da porta; ${v.name} encarnad${v.g === 'f' ? 'a' : 'o'})`);
// (the body put at a point, metres, facing yaw — as a player stands there)
const at = (X, Z, yaw) => { if (!G.Avatar.place(X / TL, Z / TL)) return false; still(3); st.yaw = yaw; IN.camYaw = yaw; still(2); return true; };
const yawTo = (X, Z) => Math.atan2(DZ - Z, DX - X);
// (the yard emptied for the proofs that only look — the world stopped —: the animals and the people about, put far away and back)
// (round the doorstep, or round the point a proof is made at — T-089)
// (and the things of the ground about it — a tree, a log waiting for whoever takes its wood, a bush, a stone —: what the hands
// offer of them is looked for in the tiles about the body, by their marks on the map; those marks taken off the tiles about the
// point and put back after. On the doorstep of the house#23918 of the sixth generation a log lay a stride ahead of the body
// turned 90° from the door, and «Pegar lenha do tronco» was, by the game's rule (L-326: the door before everything only within
// Interact.FACE of where the body looks), what one meant there — T-232)
const aside = [], marks = []; const clear = (C) => { const [CX, CZ] = C || [SX, SZ]; const k0 = aside.length; const put = o => { if (!aside.some(q => q[0] === o)) aside.push([o, o.x, o.y]); };
  for (const a of S.animals.values()) if (Math.hypot(a.x * TL - CX, a.y * TL - CZ) < 9) put(a); for (const o of S.villagers.values()) if (o !== v && !o.inside && Math.hypot(o.x * TL - CX, o.y * TL - CZ) < 9) put(o);
  god(() => { for (const [o] of aside.slice(k0)) { o.x += 60; o.y += 60; }
    const tx = Math.floor(CX / TL), ty = Math.floor(CZ / TL);
    for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const x = tx + dx, y = ty + dy; if (!W.inb(x, y)) continue; const i = W.idx(x, y);
      for (const k of ['treeAt', 'objAt']) if (S[k][i]) { marks.push([k, i, S[k][i]]); S[k][i] = 0; } } }); };
const back = () => { god(() => { for (const [o, x, y] of aside) { o.x = x; o.y = y; } for (let k = marks.length - 1; k >= 0; k--) { const [m, i, id] = marks[k]; S[m][i] = id; } }); aside.length = 0; marks.length = 0; };
// (for a proof the world runs in, those about the doorstep sent a few strides off along the street, to ground the world walks —
// not out of the world, as for the proofs that only look —, and back after: someone standing at the door is whom «E» means — T-089)
const asideRun = []; const clearRun = () => {
  const spot = (o, sv) => { for (let r = 10; r <= 16; r += 2) for (let k = 0; k < 16; k++) { const a = k / 16 * Math.PI * 2; const x = (SX + Math.cos(a) * r) / TL, y = (SZ + Math.sin(a) * r) / TL; if (W.walkableXY(x, y) && (!sv || W.reaches(o, x, y))) return [x, y]; } return null; };
  for (const o of S.villagers.values()) { if (o === v || o.inside || Math.hypot(o.x * TL - SX, o.y * TL - SZ) >= 6) continue; const to = spot(o, true); if (!to) continue; asideRun.push([o, o.x, o.y]); god(() => { G.Vg.endTask(o); o.x = to[0]; o.y = to[1]; o.path = null; }); }
  for (const a of S.animals.values()) { if (Math.hypot(a.x * TL - SX, a.y * TL - SZ) >= 6) continue; const to = spot(a, false); if (!to) continue; asideRun.push([a, a.x, a.y]); god(() => { a.x = to[0]; a.y = to[1]; a.path = null; }); } };
const backRun = () => { god(() => { for (const [o, x, y] of asideRun) { o.x = x; o.y = y; o.path = null; } }); asideRun.length = 0; };
// (an animal the hands may pet: the yard's own, or one of the world's)
const petable = a => { const d = G.Animals.DEF[a.kind]; return !a.dead && !a.held && d && d.cls !== 'water' && d.cls !== 'air' && (a.dom || a.tamed || d.dom || d.pet); };
const pets = [...S.animals.values()].filter(petable).sort((a, c) => Math.hypot(a.x * TL - SX, a.y * TL - SZ) - Math.hypot(c.x * TL - SX, c.y * TL - SZ));
const pet = pets[0] || null; const pet0 = pet ? [pet.x, pet.y] : null;
const petName = pet ? (G.Animals.DEF[pet.kind].name || pet.kind).toLowerCase() : '-';
const isPet = r => !!r && (r.id === 'carinho' || r.id === 'bicho');

// ------------------------------ 1. on the doorstep, whichever way the body faces ------------------------------
{ clear(); const rows = [], bad = [];
  for (let k = 0; k < 8; k++) {
    const yaw = yawTo(SX, SZ) + k / 8 * Math.PI * 2; if (!at(SX, SZ, yaw)) { bad.push(`${k}: não deu para pôr o corpo na soleira`); continue; }
    const r = I.best(); const ctx = I.ctx(); const a = Math.abs(Math.atan2(Math.sin(Math.atan2(DZ - ctx.Z, DX - ctx.X) - ctx.yaw), Math.cos(Math.atan2(DZ - ctx.Z, DX - ctx.X) - ctx.yaw)));
    const behind = a > 1.6; const good = behind ? !(r && r.id === 'portaPlanta') : !!r && r.id === 'portaPlanta' && r.t.d.id === e.door && /porta/.test(r.label);
    rows.push(`${deg(a)}°: ${r ? r.label : 'nada'}`); if (!good) bad.push(`a porta a ${deg(a)}°: ${r ? r.label : 'nada'}`);
  }
  back();
  ok('1. na soleira, para onde quer que o corpo olhe — salvo a porta às costas —, «E — Abrir a porta»', !!DT && rows.length === 8 && !bad.length, `a ${out.toFixed(2)} m da porta: ${rows.join(' · ')}${bad.length ? '; ERRADO: ' + bad.join(' · ') : ''}`);
}

// ------------------------------ 2. E on the doorstep: a step up to it, the door opens, in ------------------------------
{ god(() => { In.useDoor(b, e.door, 'fechar', v); }); for (let k = 0; k < 6; k++) frame();
  at(SX, SZ, yawTo(SX, SZ)); clearRun(); for (let k = 0; k < 4; k++) frame();
  const r = I.best(); const x0 = st.X, z0 = st.Z; said.length = 0;
  const ran = r && r.id === 'portaPlanta' ? I.run(r) : null; let k = 0; for (; k < 240 && G.Avatar.busy(); k++) frame(); for (let q = 0; q < 6; q++) frame();
  const dd = Math.hypot(DX - st.X, DZ - st.Z), moved = Math.hypot(st.X - x0, st.Z - z0); const s1 = In.doorState(b, e.door).state;
  // (in: square through the opening, as a player walks — until there, or the body stops: a piece of furniture may stand where
  // the walk aims, 1.3 m in —; and in once the world has it inside, a stride past the door — T-156)
  const walk = (X, Z, max, done) => { let still = 0, last = [st.X, st.Z]; for (let q = 0; q < max; q++) { const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < 0.12 || (done && done())) break; IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; frame();
    if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st.X, st.Z]; } stop(); for (let q = 0; q < 6; q++) frame(); };
  walk(DX - ux * 1.3, DZ - uz * 1.3, 300, () => v.inside === b.id && (DX - st.X) * ux + (DZ - st.Z) * uz > 0.6); for (let q = 0; q < 10; q++) frame();
  const inside = v.inside === b.id;
  ok('2. E na soleira: o corpo dá o passo até a porta, as mãos a abrem (o mundo no seu passo), e entra', !!ran && ran.ok && s1 === 'aberta' && dd <= 1.0 && moved >= out - 1.2 && inside,
    `«${r ? r.label : 'nada'}»: andou ${moved.toFixed(2)} m, parou a ${dd.toFixed(2)} m da porta (${k} quadros); a porta ${s1}; ${inside ? 'dentro' : 'fora (v.inside ' + v.inside + ')'}`);
  // (out again, by the same door, to the street)
  walk(SX, SZ, 400); for (let q = 0; q < 10; q++) frame();
  if (v.inside) ok('2. e sai de novo pela porta', false, `ainda dentro (${v.inside})`);
  backRun();
}

// ------------------------------ 3. the rule, around the door ------------------------------
if (!pet) ok('3. a regra da porta e do bicho', false, 'nenhum bicho de estimação no mundo');
else {
  clear(); const spots = [['na soleira', SX, SZ], ['a um passo da porta', DX + ux * 0.8, DZ + uz * 0.8]];
  let n = 0, nPet = 0, nDoor = 0; const bad = [];
  for (const [nm, X, Z] of spots) for (const turn of [0, 0.7, -0.7]) {
    const yaw = yawTo(X, Z) + turn; if (!at(X, Z, yaw)) { bad.push(`${nm}: não deu para pôr o corpo`); continue; }
    for (const dist of [0.3, 0.7, 1.2, 1.7]) for (const brg of [0, 0.44, -0.44, 0.87, -0.87, 1.4, -1.4]) {
      const ax = X + Math.cos(yaw + brg) * dist, az = Z + Math.sin(yaw + brg) * dist; god(() => { pet.x = ax / TL; pet.y = az / TL; });
      const ctx = I.ctx(); const r = I.best(); if (!r) { bad.push(`${nm} ${deg(turn)}°, bicho a ${dist} m ${deg(brg)}°: nada`); continue; }
      const aim = (X1, Z1) => ({ d: Math.hypot(X1 - ctx.X, Z1 - ctx.Z), ang: Math.abs(Math.atan2(Math.sin(Math.atan2(Z1 - ctx.Z, X1 - ctx.X) - ctx.yaw), Math.cos(Math.atan2(Z1 - ctx.Z, X1 - ctx.X) - ctx.yaw))) });
      const A = aim(ax, az), Dd = aim(DX, DZ); const want = A.d < Dd.d && A.ang + (I.AHEAD !== undefined ? I.AHEAD : 0.05) < Dd.ang ? 'o bicho' : 'a porta'; n++;
      const got = isPet(r) && r.t.a === pet ? 'o bicho' : r.id === 'portaPlanta' && r.t.d.id === e.door ? 'a porta' : r.id;
      if (got === 'o bicho') nPet++; if (got === 'a porta') nDoor++;
      if (got !== want) bad.push(`${nm}, a porta a ${deg(Dd.ang)}° e ${Dd.d.toFixed(2)} m, o bicho a ${deg(A.ang)}° e ${A.d.toFixed(2)} m: «${r.label}» (devia ser ${want})`);
    }
  }
  back(); god(() => { pet.x = pet0[0]; pet.y = pet0[1]; });
  // (the kind of the animal in the detail, not in the name: the name is the regression's line, the same in any world)
  ok('3. a regra, em volta da porta: o bicho só quando o corpo está mais de frente para ele que para a porta e ele está mais perto; senão, a porta', n >= 150 && !bad.length && nPet > 10 && nDoor > 60,
    `o bicho: ${petName}; ${n} lugares dele: ${nDoor} vezes a porta, ${nPet} o bicho${bad.length ? `; ${bad.length} ERRADOS: ${bad.slice(0, 3).join(' · ')}` : ''}`);
}

// ------------------------------ 4. away from any door, an animal to pet ------------------------------
if (pet) {
  // (a point of open ground a few steps from the house, no building within reach of a door's prompt — and, the yard emptied round
  // it, nothing else there to mean: the water of a ford offers a fish a stride before the body, a tree its wood — T-156)
  clear(); let far = null, r = null;
  for (let rr = 3; rr <= 8 && !far; rr += 0.5) for (let k = 0; k < 24 && !far; k++) { const a = k / 24 * Math.PI * 2; const x = SX / TL + Math.cos(a) * rr, y = SZ / TL + Math.sin(a) * rr; let free = W.walkableXY(x, y); for (let dy = -1; dy <= 1 && free; dy++) for (let dx = -1; dx <= 1 && free; dx++) { const i = W.idx(Math.floor(x) + dx, Math.floor(y) + dy); if (S.occ[i]) free = false; }
    if (!free) continue; const P = [x * TL, y * TL]; clear(P); if (at(P[0], P[1], 0.3) && !I.best()) far = P; } // (and round the point itself: someone standing before the body there is whom «E» means)
  if (far) { god(() => { pet.x = (far[0] + Math.cos(0.3) * 0.8) / TL; pet.y = (far[1] + Math.sin(0.3) * 0.8) / TL; }); r = I.best(); }
  back(); god(() => { pet.x = pet0[0]; pet.y = pet0[1]; });
  ok('4. longe de qualquer porta, o bicho diante do corpo ainda é para fazer carinho', !!far && !!r && r.id === 'carinho' && r.t.a === pet, far ? `«${r ? r.label : 'nada'}»` : 'nenhum chão livre perto');
}

// ------------------------------ 5. someone else's locked door ------------------------------
// (the walk of the estiva's proof, as a player walks — qa/visual/estiva.js, T-152 and T-205 —: toward a point, round what stops
// the feet on the way — a boulder, a pier, the wall of a lot the world's path runs a hair from — a step aside and on again,
// farther and to the other side the next time; a building is the place itself: there the walk ends)
function walkTo(X, Z, max, near) {
  let k = 0, stuck = 0, last = [st.X, st.Z], turns = 0, aside = 0, side = 1, lim = max || 400;
  for (; k < lim; k++) {
    const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < (near || 0.3)) break;
    IN.camYaw = Math.atan2(dz, dx) + (aside > 0 ? side * Math.PI / 2 : 0); if (aside > 0) aside--; IN.mz = 1; IN.mx = 0; frame();
    if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.004) {
      if (++stuck > 25) { if (turns >= 6 || Math.hypot(X - st.X, Z - st.Z) < 1.5 || !(st.block === 'ledge' || st.block === 'wall')) break; turns++; side = -side; aside = 30 * turns; lim += aside + 30; stuck = 0; }
    } else stuck = 0;
    last = [st.X, st.Z];
  }
  stop(); for (let q = 0; q < 4; q++) frame();
  return Math.hypot(X - st.X, Z - st.Z);
}
// (the frames a leg is given: what its length needs at a slow walk, 0.9 m/s, and some)
const legFrames = (X, Z, min) => Math.max(min, Math.ceil(Math.hypot(X - st.X, Z - st.Z) / 0.03) + 60);
// (an open gate on a leg gone through by the middle of its passage: a tile before it, the gate, a tile after — the world walks
// the gate's whole tile, the body only the way between its piers, L-308)
function throughGates(x0, y0, pts) {
  const out = []; let ax = x0, ay = y0;
  for (const w of pts) {
    const n = Math.ceil(Math.hypot(w[0] - ax, w[1] - ay) * 4); let last = -1;
    for (let k = 1; k <= n; k++) {
      const x = ax + (w[0] - ax) * k / n, y = ay + (w[1] - ay) * k / n; const gx = Math.floor(x), gy = Math.floor(y), i = W.idx(gx, gy);
      if (S.wall[i] !== 2 || i === last) continue; last = i;
      const ns = !!(S.wall[W.idx(gx, gy - 1)] || S.wall[W.idx(gx, gy + 1)]); // (the wall runs north to south: the passage west to east)
      const s = (ns ? Math.sign(w[0] - ax) : Math.sign(w[1] - ay)) || 1; const c = [gx + 0.5, gy + 0.5];
      for (const q of ns ? [[c[0] - s, c[1]], c, [c[0] + s, c[1]]] : [[c[0], c[1] - s], c, [c[0], c[1] + s]]) if (W.walkableXY(q[0], q[1])) out.push(q);
    }
    out.push(w); ax = w[0]; ay = w[1];
  }
  return out;
}
{ // (another house with a plan, its door on a street; one of it locks it, in the world's step)
  let H2 = null;
  const near = q => Math.hypot(q.x + q.w / 2 - v.x, q.y + q.h / 2 - v.y);
  for (const q of [...S.buildings.values()].filter(q => q !== b && q.built && In.has(q) && (q.type === 'house' || q.type === 'sobrado') && In.planDoor(q) && near(q) < 30).sort((a, c) => near(a) - near(c) || a.id - c.id)) {
    const pq = Sp.planNow(q); if (!pq || !pq.entrance || !pq.entrance.out || v.home === q.id) continue;
    const owner = [...S.villagers.values()].find(o => o.home === q.id); if (!owner) continue;
    const sx = q.x * TL + pq.entrance.out[0], sz = q.y * TL + pq.entrance.out[1]; if (!W.walkableXY(sx / TL, sz / TL) || !W.canWalk(v.x, v.y, sx / TL, sz / TL, false)) continue;
    H2 = { q, pq, owner, sx, sz }; break;
  }
  if (!H2) ok('5. a porta trancada de outra casa', false, 'nenhuma');
  else {
    const { q, pq, owner, sx, sz } = H2; god(() => { In.useDoor(q, pq.entrance.door, 'fechar', owner); In.useDoor(q, pq.entrance.door, 'trancar', owner); });
    // (the body walked there by the world's own path, as a player goes — and as the estiva's proof walks it (T-152, T-205): each
    // straight leg given the frames its length asks, round what stops the feet a step aside, an open gate by the middle of its
    // passage. A fixed 300 frames a leg — 10 s, some 18 m — left the body short of the end of a leg of 24 m, and the next, aslant
    // from there, ran it into a cliff; and a leg the world walks a hair from a lot — 0.28 m from the sobrado#18371, the body
    // 0.32 m round — held it at that wall: the house#25170 of the sixth generation, five tiles from the body, thirty on foot,
    // round a cliff — T-233)
    const path2 = W.findPath(v.x, v.y, sx / TL, sz / TL, true, 40000);
    if (path2) for (const w of throughGates(v.x, v.y, path2)) walkTo(w[0] * TL, w[1] * TL, legFrames(w[0] * TL, w[1] * TL, 300));
    walkTo(sx, sz, legFrames(sx, sz, 200));
    const pp = I.list.find(qq => qq.id === 'portaPlanta'); const t2 = (pp.find(I.ctx()) || []).find(t => t.b === q && t.d.id === pq.entrance.door);
    if (t2) { st.yaw = Math.atan2(t2.Z - st.Z, t2.X - st.X); IN.camYaw = st.yaw; still(2); }
    const r = I.best(); const x0 = st.X, z0 = st.Z; said.length = 0;
    const ran = r && r.id === 'portaPlanta' && /Bater/.test(r.label) ? I.run(r) : null; for (let k = 0; k < 240 && G.Avatar.busy(); k++) frame(); for (let k = 0; k < 4; k++) frame();
    const dd = t2 ? Math.hypot(t2.X - st.X, t2.Z - st.Z) : 9; const s2 = In.doorState(q, pq.entrance.door).state;
    ok('5. a porta trancada de outra casa, da soleira: «Bater à porta» — o corpo dá o passo até ela e bate; ela fica trancada', !!ran && dd <= 1.0 && said.some(t => /bate à porta/.test(t)) && s2 === 'trancada' && !v.inside,
      `${q.type}#${q.id}: «${r ? r.label : 'nada'}» a ${Math.hypot(x0 - (t2 ? t2.X : x0), z0 - (t2 ? t2.Z : z0)).toFixed(2)} m; depois a ${dd.toFixed(2)} m, «${said.join(' / ') || '-'}»; a porta ${s2}`);
    god(() => { In.useDoor(q, pq.entrance.door, 'destrancar', owner); });
  }
}

// ------------------------------ 5b. the door before a doorstep in the water ------------------------------
// (every building of plans whose doorstep is in a canal or a ford, the yard emptied round it: the body on the doorstep and a
// little behind it, as one comes up from the street — the door still in reach —, facing the door: the water there offers a
// fish a stride straight ahead, and the door is what one means, its own verb; turned a quarter from it, past Interact.FACE,
// the water's. The sobrado#13586 of the new metropole, two metres from its door: «Pescar com as mãos» over «Bater à porta» —
// L-326)
{ let n = 0, away = 0; const bad = [], seen = [];
  for (const q of [...S.buildings.values()].filter(q => q.built && In.has(q) && In.planDoor(q)).sort((a, c) => a.id - c.id)) {
    const pq = Sp.planNow(q); if (!pq || !pq.entrance || !pq.entrance.out) continue;
    const sx = q.x * TL + pq.entrance.out[0], sz = q.y * TL + pq.entrance.out[1]; const i = W.idx(sx / TL, sz / TL); const t = S.type[i];
    if (!(t === G.T.RIVER || t <= G.T.SEA) || S.road[i] || (S.ice && S.ice[i])) continue;
    clear([sx, sz]); if (!at(sx, sz, 0)) continue;
    const pp = I.list.find(x => x.id === 'portaPlanta'); const dt = (pp.find(I.ctx()) || []).find(x => x.b === q && x.d.id === pq.entrance.door); if (!dt) continue;
    const L0 = Math.hypot(sx - dt.X, sz - dt.Z) || 1, ox = (sx - dt.X) / L0, oz = (sz - dt.Z) / L0;
    for (const back of [0, 0.15, 0.3]) {
      const X = sx + ox * back, Z = sz + oz * back; if (!at(X, Z, Math.atan2(dt.Z - Z, dt.X - X))) continue;
      const yaw = Math.atan2(dt.Z - st.Z, dt.X - st.X); st.yaw = yaw; IN.camYaw = yaw; still(2);
      if (!I.list.find(x => x.id === 'peixe').find(I.ctx()).length) continue; n++;
      const r = I.best(); const tag = `${q.type}#${q.id} a ${Math.hypot(dt.X - st.X, dt.Z - st.Z).toFixed(2)} m: «${r ? r.label : 'nada'}»`; if (seen.length < 3) seen.push(tag); if (!(r && r.p.door && r.t.b === q)) bad.push(tag);
      st.yaw = yaw + Math.PI / 2; IN.camYaw = st.yaw; still(2); const r2 = I.best(); if (r2 && r2.id === 'peixe') away++;
    }
  }
  back();
  ok('5b. na soleira na água (um canal, um vau) e um pouco atrás dela, de frente para a porta: a porta, não o peixe que a água oferece à frente; virado um quarto dela, o peixe', n >= 3 && !bad.length && away >= 1,
    `${n} lugares na água com o peixe à frente: ${n - bad.length} a porta (${seen.join(' · ')})${bad.length ? `; ${bad.length} ERRADOS: ${bad.slice(0, 4).join(' · ')}` : ''}; virados um quarto da porta, o peixe em ${away}`);
}

// (the verifier: what weighs, S0 to S2 — and no module error)
{ const l = vbad(); ok('verificador e módulos', !l.length && JSON.stringify(G.modErr) === '{}', `${vtxt(l)} · ${JSON.stringify(G.modErr)}`); }
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
