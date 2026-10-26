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
//      open and the door shut: never moved; the verifier clean with the body's rule for its ground (Possess.onPlan), S3 too
//   2. 50 times in and out through doors, one after another: never pushed, in each time, out each time
//   3. every kind of store with a plan, its door open: the body walks in from the street — up the steps before the door, or
//      before the foot of its outside flight, where it has them, as a player goes
//   4. the steps the feet go up are the ones the 3D lays (Space.doorFlight): over each tread the body's floor is its top, and
//      the drawing has a face there
//   5. saved and loaded standing on a doorstep: there still, not moved, not taken for one who swims
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
const world3 = new Set();
const vbad = () => QA.check().filter(q => {
  if (q.sev > 3 || bad0.has(q.sys + '|' + q.msg)) return false;
  if (q.sev === 3 && q.sys !== 'avatar') { world3.add(q.msg); return false; }
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
function bodyAt(d, open) {
  if (S.avatar) G.Possess.release('deus');
  god(() => { G.Vg.endTask(v); v.inside = 0; v.x = d.O[0] / TL; v.y = d.O[1] / TL; v.path = null; const own = v.home; v.home = d.b.id;
    const s0 = In.doorState(d.b, d.e.door).state;
    if (open) { if (s0 === 'trancada') In.useDoor(d.b, d.e.door, 'destrancar', v); if (In.doorState(d.b, d.e.door).state !== 'aberta') In.useDoor(d.b, d.e.door, 'abrir', v); }
    else if (s0 === 'aberta') In.useDoor(d.b, d.e.door, 'fechar', v);
    v.home = own; });
  if (!G.Possess.take(v).ok) return false; G.Avatar.attach(v, Math.atan2(d.D[1] - d.O[1], d.D[0] - d.O[0])); for (let k = 0; k < 6; k++) frame(); return true;
}
// (walking as a player holds the stick; every frame watched: a jump of the body's place it did not walk is the world's push)
let pushes = 0, worst = 0; let last = null;
const watch = () => { const P = [v.x, v.y]; if (last) { const j = Math.hypot(P[0] - last[0], P[1] - last[1]) * TL; if (j > 0.25) { pushes++; worst = Math.max(worst, j); } } last = P; };
const st = () => G.Avatar.state();
function walk(X, Z, max, stopIn) {
  let k = 0; for (; k < (max || 240); k++) { const s = st(); const dx = X - s.X, dz = Z - s.Z; if (Math.hypot(dx, dz) < 0.15 || (stopIn && v.inside)) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mx = 0; IN.mz = 1; s.yaw = yaw; frame(); watch(); }
  IN.mz = 0; return k;
}
const pathTo = (X, Z) => { const p = W.findPath(v.x, v.y, X / TL, Z / TL, true, 30000); if (p) for (const w2 of p) walk(w2[0] * TL, w2[1] * TL, 200); };
// (in by the way in; out by it back)
function goIn(d) { const pts = wayIn(d); pathTo(pts[0][0], pts[0][1]); for (const q of pts) walk(q[0], q[1], 260); for (let k = 0; k < 6; k++) { frame(); watch(); } return v.inside === d.b.id; }
function goOut(d) { const pts = wayIn(d).slice(0, -1).reverse(); for (const q of pts) walk(q[0], q[1], 260); walk(d.O[0], d.O[1], 260); for (let k = 0; k < 6; k++) { frame(); watch(); } return !v.inside; }
const houses = [...S.buildings.values()].filter(q => q.built && In.has(q) && (q.type === 'house' || q.type === 'sobrado') && In.planDoor(q)).sort((a, c) => a.id - c.id);

// ------------------------------ 1. standing on the doorstep ------------------------------
if (part(1)) { const rows = []; let tried = 0, moved = 0, still = 0; const bad = new Set();
  for (const b of houses) {
    if (rows.length >= 25 || tried > 120) break; tried++;
    const d = door(b); if (!d || !bodyAt(d, true)) continue;
    // (in from the street until the feet are on the plan's ground the world's map has blocked, not yet within the walls)
    const pts = wayIn(d); let on = false; pathTo(pts[0][0], pts[0][1]);
    for (const q of pts) { for (let k = 0; k < 260 && !on; k++) { const s = st(); const dx = q[0] - s.X, dz = q[1] - s.Z; if (Math.hypot(dx, dz) < 0.15) break; const yaw = Math.atan2(dz, dx); IN.camYaw = yaw; IN.mz = 0.4; s.yaw = yaw; frame(); if (!v.inside && !W.walkableXY(v.x, v.y)) on = true; } if (on) break; }
    IN.mz = 0; if (!on) continue;
    const x0 = v.x, y0 = v.y; last = null; let mv = 0;
    for (const open of [true, false]) {
      if (!open) god(() => { In.useDoor(d.b, d.e.door, 'fechar', v); });
      for (let k = 0; k < 300; k++) { frame(); watch(); if (k % 10 === 0) for (const q of vbad()) bad.add(`S${q.sev} ${q.sys}: ${q.msg}`); }
      mv = Math.max(mv, Math.hypot(v.x - x0, v.y - y0) * TL);
    }
    if (mv > 0.05) moved++; else still++;
    rows.push(`${b.type}#${b.id} ${mv.toFixed(2)} m`);
  }
  ok('1. parado 3,5 s do mundo na soleira de 25 casas, no chão que a planta anda e o mapa do mundo não, de porta aberta e de porta fechada: nunca movido; verificador limpo, S3 incluído', rows.length >= 25 && !moved && !pushes && !bad.size,
    `${rows.length} casas (${tried} olhadas): ${still} paradas, ${moved} movidas; empurrões ${pushes}${worst ? ` (até ${worst.toFixed(2)} m)` : ''}; ${bad.size ? [...bad].slice(0, 3).join(' · ') : 'verificador limpo'}; a regra antiga do qa.js acusou ${oldRule} vezes onde a planta deixa (Possess.onPlan)`);
}

// ------------------------------ 2. 50 times in and out ------------------------------
if (part(2)) { pushes = 0; worst = 0; let ins = 0, outs = 0, trips = 0; const used = [];
  for (const b of houses) {
    if (trips >= 50) break; const d = door(b); if (!d || !bodyAt(d, true)) continue; last = null;
    if (!goIn(d)) continue; ins++; if (!goOut(d)) continue; outs++; trips++; used.push(b.id);
    for (let k = 0; k < 9 && trips < 50; k++) { if (!goIn(d)) break; ins++; if (!goOut(d)) break; outs++; trips++; }
  }
  const bad = vbad();
  ok('2. 50 vezes dentro e fora pela porta, uma atrás da outra: nenhum empurrão; dentro a cada vez, fora a cada vez', trips >= 50 && !pushes && ins === outs && !bad.length,
    `${trips} idas e voltas em ${used.length} casas (${used.slice(0, 6).join(', ')}…): ${ins} entradas, ${outs} saídas; empurrões ${pushes}${worst ? ` (até ${worst.toFixed(2)} m)` : ''}; ${vtxt(bad)}`);
}

// ------------------------------ 3. every kind of store, its door open ------------------------------
const flights = [];
if (part(3)) { const kinds = {}; for (const b of [...S.buildings.values()].filter(q => q.built && In.has(q) && G.BDEF[q.type] && G.BDEF[q.type].dropoff && In.planDoor(q)).sort((a, c) => a.id - c.id)) (kinds[b.type] = kinds[b.type] || []).push(b);
  const rows = [], miss = []; let n = 0, got = 0;
  for (const [t, L] of Object.entries(kinds)) { let k = 0, kin = 0;
    for (const b of L.slice(0, 6)) { const d = door(b); if (!d || !bodyAt(d, true)) continue; k++; n++; last = null; const okIn = goIn(d); if (okIn) { kin++; got++; } else { const P = G.Avatar.pos(); miss.push(`${t}#${b.id} parou a ${Math.hypot(P.X - d.D[0], P.Z - d.D[1]).toFixed(2)} m`); }
      if (d.fl) flights.push({ b, fl: d.fl }); if (d.st) { const fo = Sp.feet(d.st); const ff = Sp.doorFlight(b, d.p.shell, { w: b.w * TL, d: b.h * TL }, fo.w, fo.h, 0, false, fo.F, fo.uc); if (ff) flights.push({ b, fl: ff }); } }
    rows.push(`${t} ${kin}/${k}`); }
  ok('3. cada tipo de depósito com planta, de porta aberta: o corpo entra da rua — pelos degraus da porta, ou pelos do pé da escada de fora, onde houver', Object.keys(kinds).length >= 2 && got === n && n >= 6,
    `${rows.join(' · ')}${miss.length ? '; ' + miss.slice(0, 3).join(' · ') : ''}; empurrões ${pushes}`);
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

// (no module error)
ok('módulos', JSON.stringify(G.modErr) === '{}', `${JSON.stringify(G.modErr)}; S3 do próprio mundo, à parte (vêm também sem corpo nenhum): ${world3.size}${world3.size ? ' — ' + [...world3].slice(0, 2).join(' · ') : ''}`);
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
