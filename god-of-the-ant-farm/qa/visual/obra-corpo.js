// obra-corpo: the body in a house being extended over its family (L-371) — in Node, without a browser (the simulation of
// qa/nodemundo.js with the body's files after it, as qa/visual/corpo-casa.js):
//   node qa/visual/obra-corpo.js [mundo]       (default: the ready world «cidade»)
// The city extends a house over the family that lives in it (City.upgradeHomes: a house become a sobrado, a sobrado an
// insula; the village a hut a house): the type the new one, not built, the old one kept (b.upgradeFrom); the record — the
// plan — the old house's until the work is done (Interiors.complete makes it the new one's then). The family keeps it the
// whole work (the world's rule, P1's); the 3D draws the old house whole under the scaffold of the new one (Build3D.shellOf,
// P3); and the body walks it by the record's plan (Space: the house in work planned, P4). The proofs:
//   1. the work begun: the plan for the feet is the record's, the old house's — the same plan as before the work, its door
//   2. the body from the doorstep in by the old house's door (the hands open it): the world has it inside, its feet on the
//      plan's floor and only where the plan lets one stand
//   3. saved and loaded inside, the work going on: inside still, on the same plan, at the same place
//   4. the work done with the body inside: the record the new type's (the fact 'reforma'), the body on the new plan where it
//      lets one stand — or put out by the world onto ground it walks —, never in a wall, nor in the air
//   5. a work given up (the old type back, built: the abandoned site, Villagers' abandonSite) with the body inside: the old
//      house's plan again, the body inside on its floor
//   and the verifier clean (S0 to S2), no module error
const path = require('path');
const M = require(path.join(__dirname, '..', 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | obra-corpo ${name} | ${info}`); if (!c) fails.push(name); };
M.pronto(process.argv[2] || 'cidade');
let S = G.S; const W = G.W, TL = G.Space.TILE, In = G.Interiors, Sp = G.Space;
const RDT = 1 / 30;
const frame = () => { G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const IN = G.Avatar.input; const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const bad0 = new Set(QA.check().filter(q => q.sev <= 2).map(q => q.sys + '|' + q.msg));
const vbad = () => QA.check().filter(q => q.sev <= 2 && !bad0.has(q.sys + '|' + q.msg));
const vtxt = l => (l.length ? l.slice(0, 3).map(q => `S${q.sev} ${q.sys}: ${q.msg}`).join(' · ') : 'verificador limpo');
const st = () => G.Avatar.state();
// (every frame: the body indoors stands only where its plan lets one stand, on the plan's floor — and outdoors only where the
// world's ground holds it)
let bad = [];
function check() {
  const v = G.Possess.body(), s = st(); if (!v || !s || s.loco === 'sleep' || s.loco === 'stair' || s.loco === 'seat') return;
  const ins = Sp.indoor(s.X, s.Z, s.lv, s.inB ? s.inB.id : 0);
  if (ins) { if (s.ground && Math.abs(s.Y - ins.y) > 0.03) bad.push(`pés a ${(s.Y - ins.y).toFixed(2)} m do chão da planta em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`);
    if (!ins.walk) bad.push(`num lugar que a planta não deixa (${ins.code}) em ${ins.x.toFixed(2)},${ins.z.toFixed(2)}`); }
  else if (!W.walkableXY(v.x, v.y) && !G.Possess.afloat(v)) bad.push(`fora, num lugar onde o mundo não anda (${v.x.toFixed(2)},${v.y.toFixed(2)})`);
}
function walkTo(X, Z, max, near) {
  let k = 0, still = 0, last = [st().X, st().Z];
  for (; k < (max || 300); k++) {
    const dx = X - st().X, dz = Z - st().Z; if (Math.hypot(dx, dz) < (near || 0.15)) break;
    IN.camYaw = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0; frame(); check();
    if (Math.hypot(st().X - last[0], st().Z - last[1]) < 0.004) { if (++still > 25) break; } else still = 0; last = [st().X, st().Z];
  }
  stop(); for (let q = 0; q < 6; q++) { frame(); check(); }
  return { k, d: Math.hypot(X - st().X, Z - st().Z) };
}
// (a point straight in from the entrance, k metres past its door — square to the door's wall)
const inward = (p, k) => { const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1; let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L;
  if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz < 0) { nx = -nx; nz = -nz; } return [e.x + nx * k, e.z + nz * k]; };
const sig = p => JSON.stringify([p.fam, p.walls, p.doors, p.rooms.map(r => [r.fn, r.r]), p.entrance]);

// ------------------------------ the house, the work, the body ------------------------------
// (the city's steps: a house become a sobrado, a sobrado an insula, a hut a house — the first of these with a plan, its door
// on a street and a grown-up of it who can be lived)
const STEPS = [['house', 'sobrado'], ['sobrado', 'insula'], ['hut', 'house']];
let H = null;
for (const [from, to] of STEPS) {
  for (const b of [...S.buildings.values()].filter(q => q.built && q.type === from && In.has(q) && In.planDoor(q)).sort((a, c) => a.id - c.id)) {
    const p = Sp.planNow(b); if (!p || !p.entrance || !p.entrance.out) continue;
    const v = [...S.villagers.values()].filter(o => o.home === b.id && o.age >= 18 && o.age < 55 && !o.sleeping && G.Possess.can(o).ok).sort((a, c) => a.id - c.id)[0]; if (!v) continue;
    H = { b, p, v, from, to }; break;
  }
  if (H) break;
}
if (!H) { ok('há uma casa que a cidade amplia, com planta e um morador que se pode viver', false, 'nenhuma'); process.exit(1); }
const { b, from, to } = H; let v = H.v; const p0 = H.p; const sig0 = sig(p0);
// (the work begun as the city begins it — City.upgradeHomes —, by the god's hand)
god(() => { const def = G.BDEF[to]; b.type = to; b.built = false; b.progress = 0.1; b.upgradeFrom = from; b.need = Object.assign({ wood: 0, stone: 0 }, def.cost); b.incoming = { wood: 0, stone: 0 }; b.hp = def.hp; b.maxHp = def.hp; });
ok('há uma casa que a cidade amplia, com planta e um morador que se pode viver', true, `${from}#${b.id} → ${to} (${p0.fam}), ${v.name}`);

// ------------------------------ 1. the plan for the feet: the record's, the old house's ------------------------------
const p1 = Sp.planNow(b);
ok('1. a obra começada: a planta dos pés é a do registro, a da casa velha, a mesma de antes, com a porta dela', !!p1 && p1.ok && b.ip.t === from && sig(p1) === sig0 && !!In.planDoor(b),
  p1 ? `registro ${b.ip.t}, família ${p1.fam}; ${sig(p1) === sig0 ? 'a mesma planta' : 'OUTRA planta'}; porta ${In.planDoor(b) ? 'na rua' : 'nenhuma'}` : 'sem planta');

// ------------------------------ 2. the body in by the old house's door ------------------------------
if (!p1 || !p1.entrance) { ok('2. o corpo entra pela porta da casa velha', false, 'sem planta para os pés'); console.log(`FALHAS: ${fails.join(', ')}`); process.exit(1); }
{ const d = In.planDoor(b); god(() => { G.Vg.endTask(v); v.inside = 0; v.x = d[0]; v.y = d[1]; v.path = null; });
  if (!G.Possess.take(v).ok) { ok('2. o corpo entra pela porta da casa velha', false, `não deu para encarnar ${v.name}`); process.exit(1); }
  G.Avatar.attach(v, 0); for (let k = 0; k < 4; k++) frame();
  // (shut: the hands open it — the world in its step)
  G.Possess.apply(w => { In.useDoor(b, p1.entrance.door, 'abrir', w); return { ok: true }; }); frame();
  bad = []; const o = inward(p1, -0.6); walkTo(b.x * TL + o[0], b.y * TL + o[1], 300, 0.08); const i = inward(p1, 1.0); const r = walkTo(b.x * TL + i[0], b.y * TL + i[1], 300); frame(); frame();
  ok('2. o corpo entra pela porta da casa velha: o mundo o tem dentro, os pés no chão da planta, só onde ela deixa', v.inside === b.id && r.d < 0.3 && !bad.length,
    `dentro de ${v.inside} (a casa ${b.id}); a ${r.d.toFixed(2)} m do ponto${bad.length ? '; ' + bad.slice(0, 3).join(' · ') : '; cada quadro na planta'}`);
}

// ------------------------------ 3. saved and loaded inside, the work going on ------------------------------
{ god(() => { b.progress = 0.6; }); const x0 = v.x, y0 = v.y; M.salvarCarregar(); S = G.S; v = G.Possess.body(); const b2 = S.buildings.get(b.id); const p3 = b2 && Sp.planNow(b2);
  if (v) G.Avatar.attach(v, 0); // (the body's controller on it again, as the game does on loading a save that holds a body — Modes.wake)
  bad = []; for (let k = 0; k < 10; k++) { frame(); check(); }
  ok('3. salvo e carregado dentro, a obra andando: dentro ainda, na mesma planta, no mesmo lugar', !!v && !!b2 && !b2.built && b2.upgradeFrom === from && v.inside === b2.id && !!p3 && sig(p3) === sig0 && Math.hypot(v.x - x0, v.y - y0) < 0.02 && !bad.length,
    v && b2 ? `dentro ${v.inside === b2.id}; ${p3 && sig(p3) === sig0 ? 'a mesma planta' : 'outra planta'}; a ${(Math.hypot(v.x - x0, v.y - y0) * TL).toFixed(2)} m${bad.length ? '; ' + bad.slice(0, 2).join(' · ') : ''}` : 'sem corpo ou sem a casa');
}

// ------------------------------ 4. the work done with the body inside ------------------------------
{ const B = S.buildings.get(b.id); const r0 = B.ip.r; bad = [];
  god(() => { G.Village.completeBuilding(B); });
  for (let k = 0; k < 30; k++) { frame(); check(); }
  const p4 = Sp.planNow(B); const s = st(); const ins = Sp.indoor(s.X, s.Z, s.lv, B.id);
  const where = v.inside === B.id ? (ins && ins.walk ? 'dentro, num chão da planta nova' : `dentro, num lugar que a planta nova não deixa (${ins ? ins.code : '-'})`) : (W.walkableXY(v.x, v.y) ? 'fora, num chão que o mundo anda' : 'fora, num lugar onde o mundo não anda');
  ok('4. a obra pronta com o corpo dentro: o registro do tipo novo, o corpo num chão da planta nova ou posto fora pelo mundo, nunca na parede', B.built && B.ip.t === to && B.ip.r > r0 && !!p4 && p4.ok && !bad.length && (v.inside === B.id ? !!(ins && ins.walk) : W.walkableXY(v.x, v.y)),
    `registro ${B.ip.t} (r ${r0} → ${B.ip.r}), família ${p4 ? p4.fam : '-'}; ${where}${bad.length ? '; ' + bad.slice(0, 2).join(' · ') : ''}`);
}

// ------------------------------ 5. a work given up with the body inside ------------------------------
{ // (another work on the same house, begun as the city begins it, and given up as a site nobody reaches is — the old type back)
  const B = S.buildings.get(b.id); const to2 = STEPS.find(q => q[0] === B.type); const nb = [];
  if (!to2 || !G.BDEF[to2[1]]) ok('5. a obra largada com o corpo dentro: a planta da casa velha de novo', true, `${B.type}: a cidade não o amplia mais (nada a provar)`);
  else {
    // (the body in again, if the finished work put it out)
    if (v.inside !== B.id) { const pB = Sp.planNow(B); const d = In.planDoor(B); if (pB && d) { G.Possess.apply(w => { In.useDoor(B, pB.entrance.door, 'abrir', w); return { ok: true }; }); G.Avatar.place(d[0], d[1]); for (let k = 0; k < 4; k++) frame(); const o = inward(pB, -0.6); walkTo(B.x * TL + o[0], B.y * TL + o[1], 300, 0.08); const i = inward(pB, 1.0); walkTo(B.x * TL + i[0], B.y * TL + i[1], 300); } }
    const pOld = Sp.planNow(B); const sigOld = pOld ? sig(pOld) : '';
    god(() => { const def = G.BDEF[to2[1]]; B.type = to2[1]; B.built = false; B.progress = 0.3; B.upgradeFrom = to2[0]; B.need = Object.assign({ wood: 0, stone: 0 }, def.cost); B.incoming = { wood: 0, stone: 0 }; });
    for (let k = 0; k < 6; k++) { frame(); check(); }
    const inWork = v.inside === B.id && !!Sp.planNow(B) && sig(Sp.planNow(B)) === sigOld;
    god(() => { B.type = B.upgradeFrom; B.upgradeFrom = null; B.built = true; B.progress = 1; B.need = { wood: 0, stone: 0 }; B.incoming = { wood: 0, stone: 0 }; B.unreach = 0; });
    bad = []; for (let k = 0; k < 20; k++) { frame(); check(); } const s = st(); const ins = Sp.indoor(s.X, s.Z, s.lv, B.id); const pBack = Sp.planNow(B);
    ok('5. a obra largada com o corpo dentro: a planta da casa velha de novo, o corpo dentro no chão dela', inWork && v.inside === B.id && !!pBack && sig(pBack) === sigOld && !!(ins && ins.walk) && !bad.length,
      `na obra ${to2[0]} → ${to2[1]}: ${inWork ? 'dentro, na mesma planta' : 'NÃO dentro da mesma planta'}; largada: ${v.inside === B.id ? 'dentro' : 'fora'}, ${pBack && sig(pBack) === sigOld ? 'a planta de antes' : 'outra planta'}${bad.length ? '; ' + bad.slice(0, 2).join(' · ') : ''}`);
  }
}

// (the verifier: what weighs, S0 to S2 — and no module error)
{ const l = vbad(); ok('verificador e módulos', !l.length && JSON.stringify(G.modErr) === '{}', `${vtxt(l)} · ${JSON.stringify(G.modErr)}`); }
console.log(fails.length ? `FALHAS: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
