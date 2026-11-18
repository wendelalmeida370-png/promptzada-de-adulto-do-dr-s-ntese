// conversa-camera: the eye of the conversation (22a wave 2 — D-644, SOCIEDADE §3.9) — in Node, the game's own body and eye (the
// harness of qa/movimento.js: the world's step, the body's frame, Cam3D.update with a camera of the proof's own):
//   k1  chega     someone talking with the body, the body standing: the eye comes in to a little over a metre, the lens narrower,
//                 the look between the two faces — and it never turns (the yaw and the tilt are the player's: D-368)
//   k2  devolve   the player looks (the mouse), zooms, or the body walks: the eye goes back to the player's own distance at once
//   k3  acaba     the talk over: the eye goes back
//   k4  só se vê  the frames of the eye change nothing of the world (the save, the people, the world's chance)
//   k5  quem fala the society's verbs' answer («resposta») brings the eye in as the hands' «talk» does; a dance round the body or
//                 the arms of a hug, not
//   node qa/conversa-camera.js [mundo]          (ONLY=k1,k2 runs some)
const path = require('path');
const M = require(path.join(__dirname, 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/cam3d.js', 'js/input3d.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | conversa-camera ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
M.pronto(process.argv[2] || 'metropole');
const S = G.S, W = G.W, TL = G.Space.TILE, Av = G.Avatar, C3 = G.Cam3D, IN = Av.input;
const CAM = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000 };
function frame(rdt) { rdt = rdt || 1 / 60; IN.camYaw = C3.yaw; IN.lock = C3.locked(); IN.aim = C3.aiming(); G.debug.step(rdt * G.Space.TIME); Av.frame(rdt); const p = Av.pos(); if (p) C3.update(rdt, Object.assign({ h: 1.75 }, p), CAM); }
const frames = (s) => { for (let k = 0; k < Math.round(s * 60); k++) frame(); };
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; IN.walk = false; IN.jump = false; IN.dodge = false; IN.crouch = false; };
// (a flat open place for two: the body and someone a metre and a half before it)
const okT = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return !(!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.type[i] <= G.T.RIVER || S.slope[i] > 1.0 || S.wall[i]); };
let at = null; for (let y = 4; y < G.N - 4 && !at; y++) for (let x = 4; x < G.N - 4 && !at; x++) { let all = true; for (let a = -1; a <= 1 && all; a++) for (let b = -1; b <= 1 && all; b++) if (!okT(x + a, y + b)) all = false; if (all) at = [x + 0.5, y + 0.5]; }
const people = [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.lost && !(o.sick > 0) && G.Possess.can(o).ok).sort((a, b) => a.id - b.id);
let v = people[0], o = people[1]; // (asked again of the world at each stage: k4 loads a save, the people are new objects)
if (!at || !v || !o) { ok('palco', false, !at ? 'nenhum lugar aberto' : 'ninguém para viver'); process.exit(1); }
const YAW = 0.6;
function setup() {
  v = G.S.villagers.get(v.id) || v; o = G.S.villagers.get(o.id) || o; // (G.S: a load makes the world anew)
  if (G.Possess.body()) G.Possess.release('deus'); Av.detach();
  for (const p of [v, o]) { G.Vg.endTask(p); p.inside = 0; p.path = null; p.hp = 100; p.sleeping = false; p.hunger = 10; p.energy = 90; p.carry = null; }
  v.x = at[0]; v.y = at[1]; const d = 1.5 / TL; o.x = at[0] + Math.cos(YAW) * d; o.y = at[1] + Math.sin(YAW) * d;
  const r = G.Possess.take(v); if (!r.ok) return false;
  Av.attach(v, YAW); stop(); C3.attach(Av.pos(), YAW + Math.PI * 0.85); C3.unlock(); C3.aim(false); C3.pitch = 0.3; C3.dist = 4.8; frames(1); return true;
}
const talk = (sec) => { G.Vg.setTask(o, { type: 'talk', id: v.id, pri: 1.3, wait: sec * G.Space.TIME, kind: 'talk' }); };
const hush = () => { if (o.task && o.task.type === 'talk') G.Vg.endTask(o); };
if (!setup()) { ok('palco', false, 'o corpo não foi tomado'); process.exit(1); }
const away = C3.last.cur, fov0 = C3.last.fov;
if (want('k1')) {
  setup(); const y0 = C3.yaw, p0 = C3.pitch, cur0 = C3.last.cur; talk(30); let held = 0; for (let k = 0; k < 150; k++) { frame(); if (o.task && o.task.type === 'talk') held++; }
  const l = C3.last, face = C3.talking(); const camD = face ? Math.hypot(l.pos[0] - face.X, l.pos[2] - face.Z) : null;
  const turned = Math.abs(C3.yaw - y0) > 1e-9 || Math.abs(C3.pitch - p0) > 1e-9;
  ok('k1 chega', !!face && l.cur < 1.4 && l.fov < fov0 - 5 && !turned && held > 100, `de ${cur0.toFixed(2)} m para ${l.cur.toFixed(2)} m do ombro (${camD ? camD.toFixed(2) + ' m do outro' : 'SEM conversa'}), a lente de ${fov0.toFixed(0)}° para ${l.fov.toFixed(0)}° · o rumo e a inclinação ${turned ? 'MUDARAM' : 'os do jogador'}`);
  hush(); frames(1);
}
if (want('k2')) {
  const res = [];
  for (const [nm, act] of [['o mouse', () => C3.look(3, 0)], ['o zoom', () => C3.zoom(1)], ['o passo', () => { IN.mz = 1; }]]) {
    setup(); talk(30); frames(2.5); const inN = C3.last.cur; act(); for (let k = 0; k < 90; k++) { if (nm === 'o mouse' && k % 10 === 0) C3.look(0.2, 0); frame(); } stop();
    res.push([nm, inN, C3.last.cur, C3.talking()]); hush(); frames(0.5); }
  ok('k2 devolve', res.every(([, a, b, t]) => a < 1.4 && b > 2.2 && !t), res.map(([n, a, b, t]) => `${n}: de ${a.toFixed(2)} m de volta a ${b.toFixed(2)} m${t ? ' (AINDA PERTO)' : ''}`).join(' · '));
}
if (want('k3')) {
  setup(); talk(30); frames(2.5); const inN = C3.last.cur; hush(); frames(1.5);
  ok('k3 acaba', inN < 1.4 && C3.last.cur > 2.2 && !C3.talking(), `a conversa acabou: de ${inN.toFixed(2)} m de volta a ${C3.last.cur.toFixed(2)} m`);
}
if (want('k4')) {
  // (the same world lived twice from one save — once with the eye in for a talk, once with no eye at all —: the same at the end)
  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  setup(); talk(30); const snap = G.Save.serialize(); const life = (eye) => { G.Save.apply(JSON.parse(snap)); for (let k = 0; k < 120; k++) { G.debug.step(1 / 60 * G.Space.TIME); if (eye) { const p = Av.pos(); if (p) C3.update(1 / 60, Object.assign({ h: 1.75 }, p), CAM); } } return hash(G.Save.serialize()); };
  const a = life(true), b = life(false);
  ok('k4 só se vê', a === b, `o mesmo mundo vivido duas vezes, com o olho da conversa e sem olho nenhum: ${a === b ? 'igual' : 'DIFERENTE'}`);
}
if (want('k5')) {
  const res = [];
  for (const [nm, t, inWant] of [['a resposta', { type: 'resposta', id: v.id, act: 'talk', pri: 1.15, wait: 30 * G.Space.TIME, kind: 'talk' }, true], ['a dança', { type: 'talk', id: v.id, pri: 0.8, wait: 30 * G.Space.TIME, dance: 1 }, false], ['o abraço', { type: 'talk', id: v.id, pri: 1.25, wait: 30 * G.Space.TIME, hug: 1 }, false]]) {
    setup(); G.Vg.setTask(o, t); frames(2.5); const cur = C3.last.cur, held = !!(o.task && o.task.id === v.id); res.push([nm, held, cur, inWant ? cur < 1.4 && !!C3.talking() : cur > 2.2 && !C3.talking()]); G.Vg.endTask(o); frames(0.5); }
  ok('k5 quem fala', res.every(r => r[1] && r[3]), res.map(([n, h, c, g]) => `${n}: ${c.toFixed(2)} m${h ? '' : ' (A TAREFA CAIU)'}${g ? '' : ' (ERRADO)'}`).join(' · '));
}
const mod = Object.keys(G.modErr || {}); ok('sem erro de módulo', !mod.length, mod.length ? mod.join(', ') : 'limpo');
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
