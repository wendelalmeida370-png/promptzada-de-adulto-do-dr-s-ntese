// estiva: the docker's work, found and done by the body — in Node, without a browser (the world of qa/nodemundo.js with the 3D's
// own files after it, qa/visual/tres-node.js: the crates are where the 3D draws them):
//   node qa/visual/estiva.js [mundo]       (default: the ready world «metropole»)
// The proofs (the owner could not find the docker's work in the Modo Encarnado: nothing said where the crates were, nor where
// to take them, and the hands only reached a point beside the pile):
//   1. a boat lands its catch on a quay by day: an unloading of the world, its crates on the quay, drawn where they lie
//   2. a docker lived by the god is called to it in words that say what it is ("O cais precisa de braços: …"), only while
//      there is that work and the hands are free — not at night, not with a crate of it in the hands; anyone else is not called
//   3. the lead (Interact.lead, what the HUD shows): a stone's throw from the quay, "Descarga no cais: caixas de peixe
//      esperando" and the pile's place as drawn; farther away, or at night, nothing; and it only reads (nothing of the world
//      changes, not even from outside the world's step)
//   4. the prompt "E — Pegar a caixa…" at arm's length of the crates drawn, from every side of the pile one can stand on — and
//      not a stride farther
//   5. the lift: the crate the world offered comes to the hands at the docker's contact, and leaves the quay and its drawing
//   6. with the crate in the hands the lead is the door of the store the unloading chose (Porto.destOf): "Levar ao armazém do
//      porto"; the plain door of another store does not take it ("Esta carga é da descarga…")
//   7. at that door, "E — Guardar a caixa…": the crate goes in as a docker's — into the people's stock, the pay to the house,
//      the docker's tally, the unloading's count —, by the unloading's own act
//   8. the bad cases: saved and loaded with a crate in the hands (the lead the same, the crate put in by the same act); the god
//      pulls the store down (the lead goes to the store the unloading chooses then, or there is none); the night (the call and
//      the lead to the quay go; the crate in the hands still led to its store); the quay emptied by others (the lead goes)
//   and the verifier clean (qa.js, with the activities' and the body's rules), no module error
const path = require('path');
const T = require(path.join(__dirname, 'tres-node.js'));
const { G, M } = T.load();
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | estiva ${name} | ${info}`); if (!c) fails.push(name); };
const world = process.argv[2] || 'metropole';
M.pronto(world); M.viver(2);
let S = G.S; const W = G.W, TL = G.Space.TILE, A = G.Act, P = G.Porto, D = G.Depot, E = G.Eco, I = G.Interact, P3 = G.People3D;
const RDT = 1 / 30; const IN = G.Avatar.input;
// (the frame as the game's: the world's step, the body's frame, the people drawn around the body)
const look = () => { const p = G.Avatar.pos(); if (p) P3.update(RDT, { X: p.X, Y: p.Y, Z: p.Z }); };
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); look(); };
const still = n => { for (let k = 0; k < (n || 4); k++) { G.Avatar.frame(RDT); look(); } }; // (the world stopped: only the body and the drawing)
// (what the test does to the world stands for the god's hand, in the world's step)
const god = f => { G.inSim++; const r = f(); G.inSim--; return r; };
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg));
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const r2 = x => Math.round(x * 100) / 100;
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
// the body walked toward a point (metres), as a player holds the stick; and along the world's path to a place (tiles)
function walkTo(X, Z, max, near) {
  const st = G.Avatar.state(); let k = 0, stuck = 0, last = [st.X, st.Z];
  for (; k < (max || 400); k++) {
    const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < (near || 0.3)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame();
    if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.004) { if (++stuck > 25) break; } else stuck = 0; last = [st.X, st.Z];
  }
  stop(); for (let q = 0; q < 4; q++) frame();
  return Math.hypot(X - st.X, Z - st.Z);
}
function walkPath(x, y, near) {
  const v = G.Possess.body(); const p = W.findPath(v.x, v.y, x, y, true, 30000); if (!p) return -1;
  // (the path ends beside the place — the tile next to it —; the last steps go straight to it, to near metres of it)
  for (const w of p) walkTo(w[0] * TL, w[1] * TL, 300, 0.35);
  walkTo(x * TL, y * TL, 200, Math.max(0.3, near || 0));
  return Math.hypot(x * TL - G.Avatar.state().X, y * TL - G.Avatar.state().Z);
}
const faceTo = (X, Z) => { const st = G.Avatar.state(); st.yaw = Math.atan2(Z - st.Z, X - st.X); IN.camYaw = st.yaw; };
const said = []; G.IncUI.toast = t => { said.push(t); }; // (the words the hands' acts say: the HUD has none in Node)
const doIt = best => { said.length = 0; const r = I.run(best); for (let k = 0; k < 600 && G.Avatar.busy(); k++) frame(); for (let k = 0; k < 4; k++) frame(); return r; };

// ------------------------------ the town, the quay, the store, the docker ------------------------------
const porters = s => [...S.villagers.values()].filter(v => v.set === s.id && v.role === 'estivador').length;
const towns = [...S.settlements.values()].filter(s => [...S.buildings.values()].some(b => b.set === s.id && b.type === 'doca' && b.built) && [...S.buildings.values()].some(b => b.set === s.id && b.type === 'armazem' && b.built)).sort((a, b) => porters(b) - porters(a) || a.id - b.id);
let set = null, dock = null, fac = null;
const dry = (x, y) => { const i = W.idx(x, y); const t = S.type[i]; return !((t === G.T.RIVER && !S.road[i]) || t <= G.T.SEA) && W.walkableXY(x, y); };
for (const s of towns) {
  for (const d of [...S.buildings.values()].filter(b => b.set === s.id && b.type === 'doca' && b.built).sort((a, b) => a.id - b.id)) {
    const sp = god(() => G.Fishers.crateSpot(d)); const st = god(() => P.destOf({ at: d.id, fac: G.Village.facOfSet(d.set), x: d.x + 1, y: d.y + 1, data: {} }));
    if (sp && dry(sp[0], sp[1]) && st && st.type === 'armazem' && god(() => P.access(d, st))) { set = s; dock = d; break; }
  }
  if (dock) break;
}
if (!dock) { ok('um cais com armazém do porto', false, `nenhum em ${world}`); process.exit(1); }
fac = G.Fac.get(set.fac);
const ids = { set: set.id, dock: dock.id, fac: fac.id };
const refresh = () => { S = G.S; set = S.settlements.get(ids.set); dock = S.buildings.get(ids.dock); fac = G.Fac.get(ids.fac); };
// (a clean quay, by day: what was on it goes to the store, the unloading under way ended)
god(() => {
  for (const op of A.all()) if (op.def === 'descarga' && op.at === dock.id && A.live(op)) A.end(op, 'cancel', 'teste');
  for (const c of (dock.crates || []).slice()) D.move('q:' + dock.id, 'f:' + fac.id, c.k, c.n, { code: 'teste', part: true });
  dock.crates = []; S.time = 0.15;
});
// the docker: a stevedore of this town's warehouse, hands free, lived by the god, a stone's throw from the quay
const sp0 = god(() => G.Fishers.crateSpot(dock));
const cands = [...S.villagers.values()].filter(o => o.set === set.id && o.role === 'estivador' && !(o.carry && o.carry.n > 0) && G.Possess.can(o).ok && A.able(o) && W.reaches(o, sp0[0], sp0[1])).sort((a, b) => a.id - b.id);
let v = cands[0];
if (!v) { ok('um estivador para viver', false, `nenhum em ${set.name}`); process.exit(1); }
// (where the docker comes from: the door of the warehouse, a stone's throw from the quay — or a point one walks to from the
// crates, 16 to 20 m away)
const door0 = G.Vg.door(god(() => P.destOf({ at: dock.id, fac: fac.id, x: dock.x + 1, y: dock.y + 1, data: {} })));
let start = G.dist(door0[0], door0[1], sp0[0], sp0[1]) * TL > 8 && G.dist(door0[0], door0[1], sp0[0], sp0[1]) * TL < 24 ? door0 : null;
for (let r = 4; r <= 5 && !start; r += 0.5) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const x = sp0[0] + Math.cos(a) * r, y = sp0[1] + Math.sin(a) * r; if (dry(x, y) && W.canWalk(sp0[0], sp0[1], x, y, false)) { start = [x, y]; break; } } // (one walks to it: not only beside it)
if (!start) { ok('um lugar perto do cais', false, '-'); process.exit(1); }
god(() => { G.Vg.endTask(v); v.x = start[0]; v.y = start[1]; v.path = null; });
if (!G.Possess.take(v).ok) { ok('encarnar o estivador', false, v.name); process.exit(1); }
G.Avatar.attach(v, Math.atan2(sp0[1] - start[1], sp0[0] - start[0])); for (let k = 0; k < 6; k++) frame();
console.log(`(${set.name}: o cais #${dock.id}, o armazém ${P.destOf({ at: dock.id, fac: fac.id, x: dock.x + 1, y: dock.y + 1, data: {} }).id}; ${v.name}, ${G.roleName(v)}, a ${(G.dist(v.x, v.y, sp0[0], sp0[1]) * TL).toFixed(0)} m das caixas)`);
const callOf = () => G.Possess.calls().find(q => q.type === 'descarga') || null;
ok('2. sem descarga, nenhum chamado ao cais', !callOf(), JSON.stringify(G.Possess.calls().map(q => q.txt)));

// ------------------------------ 1. the catch comes ashore ------------------------------
const op = god(() => { P.landCatch(dock, 'food', 32, 'arenque', '#a8c0d0', 0); return P.opAt(dock); });
for (let k = 0; k < 10; k++) frame();
const opCrates = () => (dock.crates || []).filter(c => c.op === op.id);
const drawnOf = () => { const ids2 = new Set(opCrates().map(c => c.id)); return P3.lyingOf(dock.id).filter(e => ids2.has(e[4])); };
ok('1. o barco descarrega: uma descarga do mundo, as caixas no cais, desenhadas onde estão', !!op && opCrates().length >= 4 && drawnOf().length === opCrates().length,
  op ? `descarga #${op.id} (${A.STATES[op.st]}); ${opCrates().length} caixas de peixe no cais, ${drawnOf().length} desenhadas` : 'nenhuma');

// ------------------------------ 2. the call ------------------------------
const want = `O cais precisa de braços: há caixas de peixe para levar ${G.Possess.toB(P.destOf(op))}.`;
{ const c = callOf(); ok('2. o estivador encarnado é chamado ao cais, com palavras que dizem o que é', !!c && c.txt === want, c ? `«${c.txt}»` : `nenhum chamado (${JSON.stringify(G.Possess.calls().map(q => q.txt))})`); }

// ------------------------------ 3. the lead ------------------------------
const snap = () => JSON.stringify([dock.crates, op, S.loose, v.carry, S.avatar.asks]);
{ const p = G.Avatar.pos(); const s0 = snap(), o0 = D.outside || 0; let L = null; for (let k = 0; k < 60; k++) L = I.lead(v, p.X, p.Z, L && L.op);
  const dr = drawnOf(); const cx = dr.reduce((a, e) => a + e[0], 0) / dr.length, cz = dr.reduce((a, e) => a + e[2], 0) / dr.length;
  ok('3. a pista: perto do cais, a linha da descarga e o lugar das caixas desenhadas', !!L && L.step === 'pegar' && L.op === op.id && L.txt === 'Descarga no cais: caixas de peixe esperando' && Math.hypot(L.X - cx, L.Z - cz) < 0.3 && L.d > 12 && L.d <= I.LEAD,
    L ? `«${L.txt}» a ${L.d.toFixed(1)} m; o marcador a ${Math.hypot(L.X - cx, L.Z - cz).toFixed(2)} m do meio da pilha, ${(L.Y - Math.max(...dr.map(e => e[1]))).toFixed(1)} m acima` : 'nenhuma pista');
  ok('3. a pista só lê: o cais, a descarga, o chão, as mãos e os chamados como estavam, nada mudado de fora do passo do mundo', snap() === s0 && (D.outside || 0) === o0, snap() === s0 ? 'iguais' : 'mudou');
  // (far away: no lead; at night: no lead and no call)
  let far = null; for (let r = 9; r <= 12 && !far; r += 0.5) for (let k = 0; k < 24; k++) { const a = k / 24 * Math.PI * 2; const x = sp0[0] + Math.cos(a) * r, y = sp0[1] + Math.sin(a) * r; if (dry(x, y)) { far = [x, y]; break; } }
  const Lf = far ? I.lead(v, far[0] * TL, far[1] * TL) : null;
  const t0 = S.time; god(() => { S.time = 0.85; }); frame(); const Ln = I.lead(v); const cn = callOf(); god(() => { S.time = t0; }); frame();
  ok('3. longe do cais, nenhuma pista; de noite, nem pista nem chamado', !!far && !Lf && !Ln && !cn && !!callOf() && !!I.lead(v), `a ${far ? (G.dist(far[0], far[1], sp0[0], sp0[1]) * TL).toFixed(0) : '?'} m: ${Lf ? Lf.txt : 'nada'}; de noite: ${Ln ? Ln.txt : 'nada'}, ${cn ? cn.txt : 'sem chamado'}; de dia de novo: ${callOf() ? 'chamado' : 'sem chamado'}`);
}

// ------------------------------ 3. only the body's own people's work, where its feet reach ------------------------------
{ const p0 = G.Avatar.pos(); const L0 = I.lead(v, p0.X, p0.Z);
  // (a place a stone's throw from the pile that the feet do not reach from there — across the water, a pocket —, with the body put
  // there by the world: the world's step finds the crates out of reach)
  let cut = null; for (let r = 2; r <= 6 && !cut; r += 0.5) for (let k = 0; k < 32; k++) { const a = k / 32 * Math.PI * 2; const x = sp0[0] + Math.cos(a) * r, y = sp0[1] + Math.sin(a) * r; if (dry(x, y) && !W.canWalk(x, y, sp0[0], sp0[1], true)) { cut = [x, y]; break; } }
  let Lc = null, cc = null; const home = [v.x, v.y];
  if (cut) { god(() => { v.x = cut[0]; v.y = cut[1]; }); for (let k = 0; k < 6; k++) frame(); Lc = I.lead(v); cc = callOf(); god(() => { v.x = home[0]; v.y = home[1]; }); for (let k = 0; k < 6; k++) frame(); }
  ok('3. de um lugar perto da pilha de onde os pés não chegam a ela, nenhuma pista e nenhum chamado', !!L0 && !!cut && !Lc && !cc && !!I.lead(v), cut ? `em ${cut.map(n => n.toFixed(1))}, a ${(G.dist(cut[0], cut[1], sp0[0], sp0[1]) * TL).toFixed(0)} m das caixas: ${Lc ? '«' + Lc.txt + '»' : 'sem pista'}, ${cc ? 'chamado' : 'sem chamado'}; de volta: ${I.lead(v) ? 'a pista' : 'nada'}` : 'nenhum lugar assim perto deste cais');
}
// ------------------------------ 4. following the lead to the pile: the prompt comes at arm's length of the crates ------------------------------
{ const p0 = G.Avatar.pos(); const L = I.lead(v, p0.X, p0.Z); const st = G.Avatar.state();
  // (along the world's path to the quay's spot for the crates — the pile is drawn around it —, as a player walks up to it: the
  // first moment the prompt is the crate's, how far the nearest crate drawn is)
  const pth = L ? W.findPath(v.x, v.y, sp0[0], sp0[1], true, 30000) : null; let first = null, b = null;
  const nearC = () => P3.lyingOf(dock.id).reduce((m, e) => Math.min(m, Math.hypot(e[0] - st.X, e[2] - st.Z)), 99);
  const pts = (pth || []).map(w => [w[0] * TL, w[1] * TL]).concat(pth ? [[sp0[0] * TL, sp0[1] * TL]] : []);
  walk: for (const [X, Z] of pts) for (let k = 0; k < 300; k++) { if (Math.hypot(X - st.X, Z - st.Z) < 0.35) break; IN.camYaw = Math.atan2(Z - st.Z, X - st.X); IN.mz = 1; frame(); b = I.best(); if (b && b.id === 'atividade' && /^Pegar /.test(b.label)) { first = nearC(); break walk; } }
  stop(); for (let q = 0; q < 4; q++) frame();
  ok('4. seguindo a pista pelo caminho do mundo, «E — Pegar a caixa» aparece ao chegar a uns 2,5 m das caixas desenhadas', !!L && first !== null && first <= 2.7 && first >= 1.5, `pista a ${L ? L.d.toFixed(0) : '?'} m; ${pth ? pth.length + ' passos do caminho' : 'sem caminho'}; «${b ? b.label : '-'}» ${first !== null ? 'a ' + first.toFixed(2) + ' m da caixa mais perto' : 'não apareceu'}`);
}
// ------------------------------ 4. the prompt, from every side of the pile ------------------------------
let lastBest = null;
{ const dr = drawnOf(); const cx = dr.reduce((a, e) => a + e[0], 0) / dr.length, cz = dr.reduce((a, e) => a + e[2], 0) / dr.length;
  const nearest = (X, Z) => Math.min(...dr.map(e => Math.hypot(e[0] - X, e[2] - Z)));
  const at = (dir, m) => { let X = cx, Z = cz; for (let k = 0; k < 200 && nearest(X, Z) < m; k++) { X += Math.cos(dir) * 0.02; Z += Math.sin(dir) * 0.02; } return [X, Z]; };
  const sides = [], miss = []; let far = 0, farN = 0;
  for (let k = 0; k < 8; k++) {
    const dir = k / 8 * Math.PI * 2; const [X, Z] = at(dir, 2.3); const x = X / TL, y = Z / TL;
    if (!dry(x, y) || !W.canWalk(sp0[0], sp0[1], x, y, true) || !G.Avatar.place(x, y)) continue;
    still(4); faceTo(cx, cz); still(2); const b = I.best();
    const good = !!b && b.id === 'atividade' && /^Pegar /.test(b.label) && b.t.o.op === op.id;
    if (good) { sides.push(k); lastBest = { b, x, y }; } else { const ctx = I.ctx(); const o = b && b.t && b.t.o && b.t.o.id ? S.villagers.get(b.t.o.id) : null; const sc = (X1, Z1) => { const dx = X1 - ctx.X, dz = Z1 - ctx.Z; const ang = Math.abs(Math.atan2(Math.sin(Math.atan2(dz, dx) - ctx.yaw), Math.cos(Math.atan2(dz, dx) - ctx.yaw))); return `${Math.hypot(dx, dz).toFixed(2)} m ${(ang * 57.3).toFixed(0)}°`; }; const near = P3.lyingOf(dock.id).reduce((m, e) => Math.min(m, Math.hypot(e[0] - ctx.X, e[2] - ctx.Z)), 9); miss.push(`${k}: ${b ? b.label : 'nada'}${o ? ' (' + sc(b.t.X, b.t.Z) + ', ' + (o.task ? o.task.type + '.' + o.task.st : '-') + ')' : ''} caixa a ${near.toFixed(2)}`); }
    const [X2, Z2] = at(dir, 3.4); if (dry(X2 / TL, Z2 / TL) && G.Avatar.place(X2 / TL, Z2 / TL)) { still(4); faceTo(cx, cz); still(2); const b2 = I.best(); farN++; if (b2 && b2.id === 'atividade' && /^Pegar /.test(b2.label)) far++; }
  }
  ok('4. «E — Pegar a caixa» a 2,3 m das caixas desenhadas, de cada lado da pilha onde se pode estar', sides.length >= 3 && !miss.length, `${sides.length} lados com o aviso${miss.length ? '; sem: ' + miss.join(' · ') : ''}; ${lastBest ? '«' + lastBest.b.label + '»' : ''}`);
  ok('4. e não a 3,4 m', farN >= 2 && far === 0, `${far} de ${farN} lados a 3,4 m com o aviso`);
}

// ------------------------------ 5. the lift ------------------------------
let cid = 0;
if (lastBest) {
  G.Avatar.place(lastBest.x, lastBest.y); still(4); const dr = drawnOf(); faceTo(dr[0][0], dr[0][2]); still(2);
  // (a porter may take the crate offered between the key and the contact — the world says so —: E again, as a player does)
  let b = null, hand = null, r = null, tries = 0; const all = [];
  for (; tries < 3 && !(v.carry && v.carry.n > 0); tries++) { b = I.best(); if (!(b && b.id === 'atividade' && /^Pegar /.test(b.label))) break; cid = b.t.o.cid; hand = b.t.hand; r = doIt(b); all.push(...said); }
  said.length = 0; said.push(...all);
  const H = P3.look(v).held;
  ok('5. a caixa oferecida vem às mãos no contato do estivador, e sai do cais e do desenho', !!r && r.ok && !!v.carry && v.carry.op === op.id && !opCrates().some(c => c.id === cid) && !P3.lyingOf(dock.id).some(e => e[4] === cid) && !!H && H.form === 'caixaPeixe' && !!hand,
    `${b ? '«' + b.label + '»' : 'nada'}${said.length ? ' → «' + said.join(' / ') + '»' : ''}${tries > 1 ? ` (${tries} vezes E)` : ''}; nas mãos: ${v.carry ? `${v.carry.n} de ${E.name(v.carry.k)} (descarga #${v.carry.op})` : 'nada'}; desenhada nas mãos: ${H ? H.form : 'nada'}; a caixa #${cid} ${opCrates().some(c => c.id === cid) ? 'ainda no cais' : 'saiu do cais'}`);
} else ok('5. pegar a caixa', false, 'nenhum lado com o aviso');

// ------------------------------ 6. the lead to the store ------------------------------
let dest = P.destOf(op);
{ const L = I.lead(v); const d = G.Vg.door(dest);
  ok('6. com a caixa nas mãos, a pista é a porta do armazém que a descarga escolheu', !!L && L.step === 'levar' && L.b === dest.id && L.txt === `Levar ${G.Possess.toB(dest)}` && Math.abs(L.X - d[0] * TL) < 1e-6 && Math.abs(L.Z - d[1] * TL) < 1e-6 && !callOf(),
    L ? `«${L.txt}», a porta em ${(d[0] * TL).toFixed(1)}, ${(d[1] * TL).toFixed(1)} a ${L.d.toFixed(0)} m; chamado ${callOf() ? 'ainda lá' : 'saiu (as mãos estão ocupadas com ele)'}` : 'nenhuma pista');
  // (the plain door of another store of the people does not take it)
  const other = [...S.buildings.values()].filter(b => b.built && b !== dest && G.BDEF[b.type] && G.BDEF[b.type].dropoff && G.Village.facOfSet(b.set) === fac.id).sort((a, b) => a.id - b.id)[0];
  const porta = I.list.find(p => p.id === 'porta'); const c = other ? porta.can(I.ctx(), { b: other }) : null;
  ok('6. a porta de outro armazém do povo não a toma: é da descarga', !!c && !c.ok && /descarga/.test(c.why), c ? `${G.Village.buildName(other)}: «${c.why}»` : 'nenhum outro armazém');
}

// ------------------------------ 7. to the door, and in ------------------------------
{ const d = G.Vg.door(dest); const left = walkPath(d[0], d[1]);
  let b = null; for (let k = 0; k < 10 && !(b && b.id === 'atividade'); k++) { faceTo(d[0] * TL, d[1] * TL); still(1); b = I.best(); }
  const n = v.carry ? v.carry.n : 0, k0 = v.carry ? v.carry.k : 'food'; const payee = v.home && D.exists('h:' + v.home) ? 'h:' + v.home : 'p:' + v.id;
  const st0 = v.st[k0] || 0; const led0 = D.ledger().length ? D.ledger()[D.ledger().length - 1][0] : 0; const done0 = (op.done || {})[k0] || 0; const n0 = (op.roles[v.id] || {}).n || 0;
  const r = b && b.id === 'atividade' && /^Guardar /.test(b.label) ? doIt(b) : null;
  const mine = D.ledger().filter(e => e[0] > led0 && e[7] === op.id && e[9] === v.id);
  const dep = mine.find(e => e[8] === 'depositar'), pay = mine.find(e => e[8] === 'paga');
  const coin = E.coinage(fac.id); const due = r2(P.payOf(k0, n));
  ok('7. na porta, «E — Guardar a caixa…»: entra como a de um estivador — o estoque, a paga na casa, a conta dele, a da descarga', !!r && r.ok && !v.carry && !!dep && dep[3] === 'v:' + v.id && dep[4] === op.to && Math.abs(dep[6] - n) < 1e-6 && (coin ? !!pay && pay[4] === payee && pay[5] === 'moedas' && Math.abs(pay[6] - due) < 1e-6 : true) && Math.abs((v.st[k0] || 0) - st0 - n) < 1e-6 && Math.abs(((op.done || {})[k0] || 0) - done0 - n) < 1e-6 && ((op.roles[v.id] || {}).n || 0) === n0 + 1,
    `${b ? '«' + b.label + '»' : 'nada'} (a ${left.toFixed(1)} m da porta); ${dep ? `${dep[6]} de ${E.name(dep[5])} de ${dep[3]} para ${dep[4]}` : 'nada guardado'}; ${coin ? (pay ? `paga ${pay[6]} moedas a ${pay[4]} (devia ${due})` : 'sem paga') : 'povo sem moeda'}; a conta dele ${st0} → ${v.st[k0] || 0}; caixas dele na descarga ${n0} → ${(op.roles[v.id] || {}).n || 0}`);
}

// ------------------------------ 8. the bad cases ------------------------------
// (another crate in the hands, to the bad cases: picked up as before, by the pile)
function liftAgain() {
  for (let k = 0; k < 30 && !opCrates().length; k++) frame(); if (!opCrates().length) return false;
  const p = god(() => G.Fishers.crateSpot(dock)); walkPath(p[0], p[1], 1.2);
  // (a crate nobody else holds: the quay's own carriers work this unloading too, and a crate one of them goes for is his from
  // then on (Porto.claim), as the one the body's E holds is the body's (Act.begin). On a busy quay every crate may be spoken
  // for — the town's porters may claim every crate as it comes — and none frees: then another boat lands
  // its catch on the same quay, into the same unloading, and the body at the pile takes one of the new — C1, with C3's word)
  const freeOne = () => drawnOf().find(e => { const c = opCrates().find(q => q.id === e[4]); return c && (!c.by || c.by === v.id); });
  const pegar = q => q && q.id === 'atividade' && /^Pegar /.test(q.label) && q.ok;
  for (let round = 0; round < 4 && !(v.carry && v.carry.n > 0) && A.live(op); round++) {
    let e = freeOne(); for (let k = 0; k < 150 && !e && opCrates().length; k++) { frame(); e = freeOne(); }
    if (!e && A.live(op)) { god(() => P.landCatch(dock, 'food', 16, 'arenque', '#a8c0d0', 0)); still(2); e = freeOne(); }
    if (!e) continue;
    faceTo(e[0], e[2]); still(2);
    let b = I.best(); for (let k = 0; k < 20 && !pegar(b); k++) { e = freeOne() || e; walkTo(e[0], e[2], 30, 1.4); faceTo(e[0], e[2]); still(1); b = I.best(); }
    if (pegar(b)) doIt(b);
  }
  return !!(v.carry && v.carry.op === op.id);
}
{ // saved and loaded with a crate in the hands
  const lifted = liftAgain(); const L0 = I.lead(v);
  M.salvarCarregar(); refresh(); v = G.Possess.body(); if (v) { G.Avatar.attach(v, 0); for (let k = 0; k < 6; k++) frame(); }
  const op2 = v && v.carry ? A.get(v.carry.op) : null; const L1 = v ? I.lead(v) : null;
  ok('8. salvo e carregado com a caixa nas mãos: a mesma pista ao mesmo armazém', lifted && !!v && !!op2 && !!L0 && !!L1 && L1.step === 'levar' && L1.b === L0.b && L1.txt === L0.txt, `${lifted ? 'pegou outra' : 'não pegou outra'}; antes «${L0 ? L0.txt : '-'}», depois «${L1 ? L1.txt : '-'}»`);
  // the night: the crate in the hands still led to its store; no call
  const t0 = S.time; god(() => { S.time = 0.85; }); frame(); const Ln = v ? I.lead(v) : null; const cn = callOf(); god(() => { S.time = t0; }); frame();
  ok('8. de noite, com a caixa nas mãos, a pista ainda leva ao armazém; nenhum chamado', !!Ln && Ln.step === 'levar' && !cn, `${Ln ? Ln.txt : 'nada'}; ${cn ? cn.txt : 'sem chamado'}`);
  // the god pulls the store down: the lead goes to the store the unloading chooses then, or there is none
  const d0 = op2 ? P.destOf(op2) : null;
  if (d0) god(() => G.Village.destroyBuilding(d0, 'deus'));
  // (a ruin is no store: no lead to it, at once; the overseer chooses again within a second of the world)
  const Lr = v ? I.lead(v) : null;
  for (let k = 0; k < 150; k++) frame();
  const d1 = op2 && A.live(op2) ? P.destOf(op2) : null; const L2 = v ? I.lead(v) : null;
  const store = b => !!b && !!G.BDEF[b.type] && !!G.BDEF[b.type].dropoff;
  const okL = store(d1) ? !!L2 && L2.step === 'levar' && L2.b === d1.id && L2.b !== d0.id : !L2;
  ok('8. o deus derruba o armazém: nenhuma pista à ruína; depois, ao que a descarga escolhe então, ou nenhuma', !!d0 && (!Lr || Lr.b !== d0.id) && okL, `derrubado ${d0 ? G.Village.buildName(d0) + ' #' + d0.id : '-'}; logo depois «${Lr ? Lr.txt + ' #' + Lr.b : 'nenhuma pista'}»; agora ${d1 ? G.Village.buildName(d1) + ' #' + d1.id + (store(d1) ? '' : ' (não é armazém)') : 'nenhum'}; pista «${L2 ? L2.txt + ' #' + L2.b : '-'}»`);
  // the quay emptied by others: the lead goes
  if (v && v.carry) god(() => { D.drop('v:' + v.id, v.carry.k, v.carry.n, v.x, v.y, { op: v.carry.op, code: 'pousou', by: v.id, fac: fac.id }); });
  const opNow = A.get(op.id);
  god(() => { if (opNow && A.live(opNow)) { for (const c of (dock.crates || []).slice()) if (c.op === opNow.id) D.move('q:' + dock.id, 'f:' + fac.id, c.k, c.n, { op: opNow.id, code: 'teste', part: true }); for (const o of (S.loose || []).slice()) if (o.op === opNow.id) D.move('g:' + o.id, 'f:' + fac.id, o.k, o.n, { op: opNow.id, code: 'teste', part: true }); } });
  for (let k = 0; k < 60; k++) frame();
  const L3 = v ? I.lead(v) : null;
  ok('8. o cais esvaziado por outros: a pista some', !L3 || L3.op !== op.id, L3 ? `ainda: «${L3.txt}»` : 'nenhuma pista');
}
{ // someone of another people, a stone's throw from the quay: the unloading is not their people's work — no lead, no call
  if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
  const sp = god(() => G.Fishers.crateSpot(dock)); god(() => P.landCatch(dock, 'food', 16, 'arenque', '#a8c0d0', 0));
  const o = [...S.villagers.values()].filter(q => G.Fac.idOfV(q) !== fac.id && q.age >= 18 && !(q.carry && q.carry.n > 0) && G.Possess.can(q).ok && A.able(q)).sort((a, b) => a.id - b.id)[0];
  let L = null, c = null;
  if (o) { god(() => { G.Vg.endTask(o); o.x = start[0]; o.y = start[1]; o.path = null; }); G.Possess.take(o); G.Avatar.attach(o, 0); for (let k = 0; k < 10; k++) frame(); L = I.lead(o); c = callOf(); }
  ok('2. alguém de outro povo, perto do cais: a descarga não é do povo dele — nem pista nem chamado', !!o && !c && !L && !!P.opAt(dock), o ? `${o.name}, ${G.roleName(o)} de ${(G.Fac.get(G.Fac.idOfV(o)) || {}).name}: ${L ? '«' + L.txt + '»' : 'sem pista'}, ${c ? 'chamado' : 'sem chamado'}` : 'ninguém de outro povo');
}
{ // anyone else lived by the god is not called to the quay — the call is the trade's —, but sees the lead to it as anyone would
  if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach();
  const sp = god(() => G.Fishers.crateSpot(dock));
  const o = [...S.villagers.values()].filter(q => q.set === set.id && q.role !== 'estivador' && q.role !== 'pescador' && q.age >= 18 && !(q.carry && q.carry.n > 0) && G.Possess.can(q).ok && A.able(q) && W.reaches(q, sp[0], sp[1])).sort((a, b) => a.id - b.id)[0];
  let L = null, c = null;
  if (o) { god(() => { G.Vg.endTask(o); o.x = start[0]; o.y = start[1]; o.path = null; P.landCatch(dock, 'food', 16, 'arenque', '#a8c0d0', 0); }); G.Possess.take(o); G.Avatar.attach(o, 0); for (let k = 0; k < 10; k++) frame(); L = I.lead(o); c = callOf(); }
  ok('2. quem não é do ofício não é chamado ao cais, mas vê a pista dele', !!o && !c && !!L && L.step === 'pegar', o ? `${o.name}, ${G.roleName(o)}: ${c ? '«' + c.txt + '»' : 'sem chamado'}; pista «${L ? L.txt : '-'}»` : 'ninguém');
}
// (the verifier: what weighs, S0 to S2 — and no module error)
{ const l = vbad(); ok('verificador e módulos', !l.length && JSON.stringify(G.modErr) === '{}', `${vtxt(l)} · ${JSON.stringify(G.modErr)}`); }
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
