// olho-dentro: o olho do corpo dentro dos prédios (os interiores 2.0, a frente P4 — D-730 a D-739) — em Node, o corpo e o olho do
// próprio jogo quadro a quadro (o arreio do qa/movimento.js: o passo do mundo, o quadro do corpo, o Cam3D.update com uma câmera da
// prova), o corpo entrando pela porta de fora e andando pela planta como um jogador (o olho girado atrás dele, até 4 rad/s):
//   o1  o terreiro (L-1860): da porta da rua de cada taverna e olaria com terreiro até o salão, o olho nunca dentro do sólido
//   node qa/olho-dentro.js [mundo]          (padrão: o mundo pronto «metropole»; ONLY=o1,o2 roda só essas partes)
const path = require('path');
const M = require(path.join(__dirname, 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/cam3d.js', 'js/input3d.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | olho-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
M.pronto(process.argv[2] || 'metropole');
const S = () => G.S; const TL = G.Space.TILE, Av = G.Avatar, C3 = G.Cam3D, IN = Av.input, Sp = G.Space, In = G.Interiors;
const RDT = 1 / 60; const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const r2 = x => Math.round(x * 100) / 100;
// (the camera of the proof: the 3D is not drawn here; its aspect the PC's, 16:9)
const CAM = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000, aspect: 16 / 9 };
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; IN.walk = false; IN.jump = false; IN.dodge = false; IN.crouch = false; };
// (each frame: the world's step, the body, the eye — and what the verifier of the eye says of it)
let rec = null;
function frame(tag) {
  IN.camYaw = C3.yaw; IN.lock = C3.locked(); IN.aim = C3.aiming(); G.debug.step(RDT * Sp.TIME); Av.frame(RDT);
  const p = Av.pos(); if (!p) return; C3.update(RDT, Object.assign({ h: 1.75 }, p), CAM);
  if (rec) { const bad = QA.eye ? QA.eye() : (C3.inside ? ['o olho dentro do sólido'] : []); rec.n++; if (bad.length) { rec.bad++; if (!rec.first) rec.first = `${tag}: ${bad[0]}`; }
    const l = C3.last; if (rec.prev) { const j = Math.hypot(l.pos[0] - rec.prev[0], l.pos[1] - rec.prev[1], l.pos[2] - rec.prev[2]); if (j > rec.jump) rec.jump = j; } rec.prev = l.pos.slice(); rec.cur.push(l.cur); }
}
const watch = () => (rec = { n: 0, bad: 0, first: '', jump: 0, prev: null, cur: [] });
// (the walk of a player: toward each point, the eye turned behind the body at a hand's speed; stuck, it says so)
function walkTo(X, Z, tag, max) {
  const st = Av.state(); let still = 0, last = [st.X, st.Z];
  for (let k = 0; k < (max || 900); k++) {
    const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < 0.18) break; const y = Math.atan2(dz, dx); IN.mz = 1; IN.mx = 0;
    const da = wrap(y - C3.yaw); C3.yaw += Math.sign(da) * Math.min(Math.abs(da), 4 * RDT); IN.camYaw = C3.yaw;
    // (the feet pushed toward the point, whatever the eye: the push turned into the eye's frame)
    const a = wrap(y - C3.yaw); IN.mz = Math.cos(a); IN.mx = Math.sin(a);
    frame(tag); if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.003) { if (++still > 40) { stop(); return false; } } else still = 0; last = [st.X, st.Z];
  }
  stop(); return true;
}
// (someone to live, put a few steps outside the building's way in, the door opened — as the hands open it — and the body walked in
// along the plan's own path to a point of a room: Interiors.pathIn)
function grownUp(b) { return [...S().villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && !o.aboard && !(o.lost && o.lost.leg) && G.Possess.can(o).ok).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y))[0]; }
function doorOut(b, p) {
  const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
  let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L; if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz > 0) { nx = -nx; nz = -nz; }
  return { e, nx, nz, at: k => [b.x * TL + e.x + nx * k, b.y * TL + e.z + nz * k] };
}
function enter(b, goal) {
  const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance) return { ok: false, why: 'sem planta' };
  const v = grownUp(b); if (!v) return { ok: false, why: 'ninguém para viver' };
  if (G.Possess.body()) G.Possess.release('deus'); Av.detach();
  const D = doorOut(b, p); const o0 = D.at(1.6);
  G.Vg.endTask(v); v.inside = 0; v.x = o0[0] / TL; v.y = o0[1] / TL; v.path = null; v.hp = 100; v.sleeping = false; v.hunger = 10; v.energy = 90; v.carry = null;
  if (!G.Possess.take(v).ok) return { ok: false, why: 'não encarnou' };
  v.job = b.id; const yaw = Math.atan2(-D.nz, -D.nx); Av.attach(v, yaw); stop(); C3.attach(Av.pos(), yaw); C3.unlock(); C3.aim(false); C3.pitch = 0.26; C3.dist = C3.OPT.dist = 4.8;
  for (const d of p.doors) G.Possess.apply(w => { In.useDoor(b, d.id, 'destrancar', w); return In.useDoor(b, d.id, 'abrir', w); });
  for (let k = 0; k < 6; k++) frame('fora');
  const pi = In.pathIn(b, goal); const pts = (pi ? pi.pts : []).filter(q => q[2] === (p.entryLv || 0));
  let walked = true; for (const q of [D.at(0.6), ...pts.map(q => [b.x * TL + q[0], b.y * TL + q[1]])]) if (!walkTo(q[0], q[1], 'entra')) { walked = false; break; }
  return { ok: true, v, p, walked, inside: !!Av.indoors(), world: G.Possess.body().inside === b.id };
}
// (the biggest room of the way in's storey, and the point of it the body can stand on nearest its middle)
function mainRoom(b, p) {
  const lv = p.entryLv || 0; const rooms = p.rooms.filter(m => m.lv === lv && !m.open).sort((a, c) => (c.r[2] - c.r[0]) * (c.r[3] - c.r[1]) - (a.r[2] - a.r[0]) * (a.r[3] - a.r[1]));
  for (const m of rooms) { const cx = (m.r[0] + m.r[2]) / 2, cz = (m.r[1] + m.r[3]) / 2; let best = null, bd = 1e9;
    for (let x = m.r[0] + 0.4; x < m.r[2] - 0.4; x += 0.1) for (let z = m.r[1] + 0.4; z < m.r[3] - 0.4; z += 0.1) if (In.walk(b, lv, x, z, 0.36)) { const d = Math.hypot(x - cx, z - cz); if (d < bd) { bd = d; best = [x, z]; } }
    if (best) return { m, x: best[0], z: best[1], lv }; }
  return null;
}
// (the eye turned round the body standing still — all round, at three tilts, slowly as a hand turns it)
function lookAround(tag) { for (const pitch of [0.26, 0.6, 1.0]) { C3.pitch = pitch; for (let k = 0; k < 96; k++) { C3.yaw += Math.PI * 2 / 96; frame(tag + '@' + pitch); } } C3.pitch = 0.26; }

// ================================ o1: o terreiro ================================
if (want('o1')) {
  const res = []; let tot = 0, bad = 0;
  const bs = [...S().buildings.values()].filter(b => (b.type === 'taverna' || b.type === 'olaria') && b.built && !b.ruin && In.has(b)).sort((a, c) => a.id - c.id);
  for (const b of bs) {
    const p = Sp.planNow(b); if (!p || !p.ok || !p.shell.yard || !p.entrance) continue;
    const d = p.doors[p.entrance.door]; if (!d.rooms.some(r => { const m = p.rooms.find(q => q.id === r); return m && m.open; }) && !d.rooms.includes('rua')) continue;
    const mr = mainRoom(b, p); if (!mr) continue;
    watch(); const r = enter(b, { x: mr.x, z: mr.z, lv: mr.lv }); if (!r.ok) continue;
    for (let k = 0; k < 30; k++) frame('parado'); const R = rec; rec = null;
    tot += R.n; bad += R.bad; res.push(`${b.type}#${b.id} ${R.bad}/${R.n}${R.first ? ' (' + R.first + ')' : ''}${r.walked ? '' : ' (PRESO)'}`);
    if (res.length >= 8) break;
  }
  ok('o1 o terreiro: da porta da rua até o salão, o olho nunca dentro do sólido', res.length >= 3 && bad === 0, `${res.length} prédios, ${bad} de ${tot} quadros com o olho dentro do sólido · ${res.join(' · ')}`);
}

const mod = Object.keys(G.modErr || {}); ok('sem erro de módulo', !mod.length, mod.length ? mod.join(', ') : 'limpo');
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
