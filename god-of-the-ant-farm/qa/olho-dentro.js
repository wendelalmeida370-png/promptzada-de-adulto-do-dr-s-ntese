// olho-dentro: o olho do corpo dentro dos prédios (os interiores 2.0, a frente P4 — D-730 a D-739) — em Node, o corpo e o olho do
// próprio jogo quadro a quadro (o arreio do qa/movimento.js: o passo do mundo, o quadro do corpo, o Cam3D.update com uma câmera da
// prova), o corpo entrando pela porta de fora e andando pela planta como um jogador (o olho girado atrás dele, até 4 rad/s). Em cada
// quadro, o verificador do olho (QA.eye: nunca dentro do sólido; com o corpo sob um teto, nunca debaixo do piso, nunca dentro do que
// se desenha do prédio sem o corte, e nada sem o corte entre o olho e o corpo):
//   o1  o terreiro (L-1860): da porta da rua de cada taverna e olaria com terreiro até o salão
//   o2  todo prédio: em cada tipo com planta, o corpo entra, anda até o meio do maior cômodo e gira o olho em volta, em três inclinações
//   o3  a quarta parede (D-730): na taverna, na casa, na ínsula, no sobrado e no paço, o olho fica na distância do jogador — nunca a
//       menos de 1 m do ombro — e vê a sala (o chão visto pela lente e pelo corte, no PC e no celular em pé)
//   o4  a porta sem salto (D-735): entrando e saindo pela porta, o olho nunca salta num quadro (antes, 4 a 5 m)
//   o5  o quarteirão colado: com o olho para o lado de um vizinho de parede (colado, ou do outro lado de um beco), o vizinho o para —
//       nunca dentro dele, nada dele entre o olho e o corpo
//   o6  o save no meio: salvo e aberto com o olho do outro lado da parede e a vista da sala ligada — o olho de volta atrás do corpo, a
//       vista desligada, o verificador limpo desde o primeiro quadro
//   o7  a mira do arco: mirando dentro de casa, o raio do meio da tela passa pela parede só onde ela está cortada, e o primeiro sólido
//       que ele encontra fica à frente do corpo
//   o8  a vista da sala (D-731): pedida, o olho sobe acima do teto cortado e vê a sala inteira de cima; pedida de novo, volta; o rumo e
//       a inclinação do jogador nunca mudam; sai do prédio, acaba; fora de casa, não liga
//   o9  a lente pela tela (D-732): nunca menos de 50° de lado (o celular em pé abre para cima e para baixo); uns graus a mais dentro de
//       casa, entrando devagar; a conversa dentro de casa não fecha a lente
//   o10 o corpo contra os móveis (D-734): empurrado contra cada peça do cômodo, o corpo nunca entra nela — o círculo dos ombros só
//       onde a peça é mais baixa que o quadril, e só a sua folga —, e sai andando para longe dela
//   o11 só se vê: o mesmo mundo vivido duas vezes do mesmo save — com o olho da quarta parede, o corte e a vista, e sem olho — igual
//   o12 o «Travar» (D-733): nunca através da parede; dentro de casa, só quem vem contra o corpo
//   o13 a trama: o olho junto da cabeça (uma parede atrás) põe o corpo em trama; longe, nunca
//   o14 a tela pelo lugar (D-733): sob um teto e em paz, o «Correr» e o trio da luta descansam; voltam com a briga, a ameaça, a arma
//   node qa/olho-dentro.js [mundo]          (padrão: o mundo pronto «metropole»; ONLY=o1,o4 roda só essas partes)
const path = require('path');
const M = require(path.join(__dirname, 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/cam3d.js', 'js/input3d.js', 'js/incui.js', 'js/modes.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | olho-dentro ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
M.pronto(process.argv[2] || 'metropole');
const S = () => G.S; const TL = G.Space.TILE, Av = G.Avatar, C3 = G.Cam3D, IN = Av.input, Sp = G.Space, In = G.Interiors;
const RDT = 1 / 60; const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const r2 = x => Math.round(x * 100) / 100;
// (the camera of the proof: the 3D is not drawn here; its aspect the PC's, 16:9 — or the phone's upright, 390 × 844)
const CAM = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000, aspect: 16 / 9 };
const PC = 16 / 9, PHONE = 390 / 844;
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; IN.walk = false; IN.jump = false; IN.dodge = false; IN.crouch = false; };
// (each frame: the world's step, the body, the eye — and what the verifier of the eye says of it)
let rec = null;
function frame(tag) {
  IN.camYaw = C3.yaw; IN.lock = C3.locked(); IN.aim = C3.aiming(); G.debug.step(RDT * Sp.TIME); Av.frame(RDT);
  const p = Av.pos(); if (!p) return; C3.update(RDT, Object.assign({ h: 1.75 }, p), CAM);
  if (rec) { const bad = QA.eye(); rec.n++; if (bad.length) { rec.bad++; if (!rec.first) rec.first = `${tag}: ${bad[0]}`; }
    const l = C3.last; if (rec.prev) { const j = Math.hypot(l.pos[0] - rec.prev[0], l.pos[1] - rec.prev[1], l.pos[2] - rec.prev[2]); if (j > rec.jump) { rec.jump = j; rec.jumpAt = tag; } } rec.prev = l.pos.slice(); rec.cur.push(l.cur); }
}
const frames = (n, tag) => { for (let k = 0; k < n; k++) frame(tag || ''); };
const watch = () => (rec = { n: 0, bad: 0, first: '', jump: 0, jumpAt: '', prev: null, cur: [] });
const unwatch = () => { const R = rec; rec = null; return R; };
// (the walk of a player: toward each point, the eye turned behind the body at a hand's speed (back: the eye ahead of the body);
// stuck, it says so)
function walkTo(X, Z, tag, o) {
  o = o || {}; const st = Av.state(); let still = 0, last = [st.X, st.Z];
  for (let k = 0; k < (o.max || 900); k++) {
    const dx = X - st.X, dz = Z - st.Z; if (Math.hypot(dx, dz) < (o.near || 0.18)) break; const y = Math.atan2(dz, dx) + (o.back ? Math.PI : 0);
    if (!o.fixEye) { const da = wrap(y - C3.yaw); C3.yaw += Math.sign(da) * Math.min(Math.abs(da), 4 * RDT); }
    const a = wrap(Math.atan2(dz, dx) - C3.yaw); IN.mz = Math.cos(a); IN.mx = Math.sin(a);
    frame(tag); if (Math.hypot(st.X - last[0], st.Z - last[1]) < 0.003) { if (++still > 40) { stop(); return false; } } else still = 0; last = [st.X, st.Z];
  }
  stop(); return true;
}
const grownUp = (b, f) => [...S().villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && !o.aboard && !(o.lost && o.lost.leg) && !(o.sick > 0) && G.Possess.can(o).ok && (!f || f(o))).sort((a, c) => G.dist(a.x, a.y, b.x, b.y) - G.dist(c.x, c.y, b.x, b.y) || a.id - c.id)[0];
function fresh(v) { G.Vg.endTask(v); v.path = null; v.hp = 100; v.sleeping = false; v.hunger = 10; v.energy = 90; v.carry = null; v.downT = 0; }
function take(v, yaw) { if (!G.Possess.take(v).ok) return false; Av.attach(v, yaw); stop(); C3.attach(Av.pos(), yaw); C3.unlock(); C3.aim(false); C3.vista(false); C3.pitch = 0.26; C3.dist = C3.OPT.dist = 4.8; return true; }
const release = () => { if (G.Possess.body()) G.Possess.release('deus'); Av.detach(); };
// (the street door of a plan: its point and the way out)
function doorOut(b, p) {
  const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const L = Math.hypot(w.b[0] - w.a[0], w.b[1] - w.a[1]) || 1;
  let nx = -(w.b[1] - w.a[1]) / L, nz = (w.b[0] - w.a[0]) / L; if ((p.lot.w / 2 - e.x) * nx + (p.lot.w / 2 - e.z) * nz > 0) { nx = -nx; nz = -nz; }
  return { e, nx, nz, at: k => [b.x * TL + e.x + nx * k, b.y * TL + e.z + nz * k] };
}
// (the steps before the door as a player sees them: a flight along the wall — the landing at the door, the treads down to the side —
// is taken from its foot, as the player who sees it goes; else straight at the door (Space.doorFlight, the steps the 3D lays))
function stepsWay(b, p, D) {
  const e = p.entrance; const d = p.doors[e.door]; const w = p.walls[d.wall]; const h = p.holes.find(q => q.door === e.door); const l = p.levels.find(q => q.lv === w.lv);
  const fl = h ? Sp.doorFlight(b, p.shell, { w: b.w * TL, d: b.h * TL }, w, h, l ? l.y : 0, false) : null; const X0 = b.x * TL, Z0 = b.y * TL;
  if (!fl || !fl.treads.some(t => t.kind === 'side')) return { from: D.at(1.6), way: [D.at(0.6)] };
  const lo = fl.treads.reduce((q, t) => (t.y < q.y ? t : q)); const at = (a, n) => { const q = fl.P(a, n); return [X0 + q[0], Z0 + q[1]]; };
  const up = fl.treads.filter(t => t.kind === 'side').sort((a, c) => a.y - c.y);
  return { from: at(lo.a + Math.sign(lo.a) * 0.3, lo.n + 1.3), way: [...up.map(t => at(t.a, t.n)), at(0, fl.treads.find(t => t.kind === 'landing').n), D.at(0.6)] };
}
const openAll = (b, p) => { for (const d of p.doors) G.Possess.apply(w => { In.useDoor(b, d.id, 'destrancar', w); return In.useDoor(b, d.id, 'abrir', w); }); };
// (someone to live put a few steps outside the building's way in, the doors opened as the hands open them, and walked in along the
// plan's own path to a point of a room: Interiors.pathIn)
function enter(b, goal) {
  const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance) return { ok: false, why: 'sem planta' };
  const v = grownUp(b); if (!v) return { ok: false, why: 'ninguém para viver' };
  release(); const D = doorOut(b, p); const SW = stepsWay(b, p, D); const o0 = SW.from; fresh(v); v.inside = 0; v.x = o0[0] / TL; v.y = o0[1] / TL;
  if (!take(v, Math.atan2(-D.nz, -D.nx))) return { ok: false, why: 'não encarnou' };
  v.job = b.id; openAll(b, p); frames(6, 'fora');
  const pi = In.pathIn(b, goal); const pts = (pi ? pi.pts : []).filter(q => q[2] === (p.entryLv || 0));
  const way = [...SW.way, ...pts.map(q => [b.x * TL + q[0], b.y * TL + q[1]])];
  let walked = true; for (const q of way) if (!walkTo(q[0], q[1], 'entra')) { walked = false; break; }
  // (out again by the same way, to the street: back along the path, out of the door, a few steps on)
  const leave = (tag) => { for (const q of way.slice(0, -1).reverse()) if (!walkTo(q[0], q[1], tag || 'sai')) return false; const far = SW.way.length > 1 ? SW.from : D.at(4.5); return walkTo(far[0], far[1], tag || 'sai'); };
  return { ok: true, v, p, D, walked, leave, inside: !!Av.indoors(), world: G.Possess.body().inside === b.id };
}
// (the biggest room of the way in's storey, and the points of it the body can stand on, nearest its middle first)
function mainRoom(b, p) {
  const lv = p.entryLv || 0; const rooms = p.rooms.filter(m => m.lv === lv && !m.open).sort((a, c) => (c.r[2] - c.r[0]) * (c.r[3] - c.r[1]) - (a.r[2] - a.r[0]) * (a.r[3] - a.r[1]));
  for (const m of rooms) { const pts = []; for (let x = m.r[0] + 0.4; x < m.r[2] - 0.4; x += 0.2) for (let z = m.r[1] + 0.4; z < m.r[3] - 0.4; z += 0.2) if (In.walk(b, lv, x, z, 0.36)) pts.push([x, z]);
    if (pts.length >= 4) { const cx = (m.r[0] + m.r[2]) / 2, cz = (m.r[1] + m.r[3]) / 2; pts.sort((a, c) => Math.hypot(a[0] - cx, a[1] - cz) - Math.hypot(c[0] - cx, c[1] - cz)); return { m, lv, x: pts[0][0], z: pts[0][1], pts }; } }
  return null;
}
// (the body put straight in a room — as a game loaded there has it —, the eye behind it at the player's distance)
function placeIn(b, at, yaw) {
  const p = Sp.planNow(b); const v = grownUp(b); if (!v) return null; release(); fresh(v); v.inside = b.id; v.x = b.x + at[0] / TL; v.y = b.y + at[1] / TL;
  if (!take(v, yaw || 0)) return null; v.job = b.id; for (const d of p.doors) if (!d.outer) G.Possess.apply(w => In.useDoor(b, d.id, 'abrir', w)); frames(30, 'posto'); return Av.indoors() ? v : null;
}
// (the eye turned round the body standing still — all round, at three tilts, slowly as a hand turns it)
function lookAround(tag) { for (const pitch of [0.26, 0.6, 1.0]) { C3.pitch = pitch; for (let k = 0; k < 96; k++) { C3.yaw += Math.PI * 2 / 96; frame(tag + '@' + pitch); } } C3.pitch = 0.26; }
// (what is drawn at a point: the plan's solid of the building the body is in, less the cut; of the others, all)
const drawnAt = (X, Y, Z) => C3.solidAll(X, Y, Z) && !C3.inCut(X, Y, Z);
// (how much of a room's floor the eye sees — points every 20 cm at 0,8 m, the tables' height —: in the lens of the screen's aspect and
// with nothing drawn on the way)
function seen(b, p, room, lv, asp) {
  const l = C3.last; const E = l.pos, A = l.at; let fx = A[0] - E[0], fy = A[1] - E[1], fz = A[2] - E[2]; const fn = Math.hypot(fx, fy, fz); fx /= fn; fy /= fn; fz /= fn;
  let rx = fz, rz = -fx; const rn = Math.hypot(rx, rz) || 1; rx /= rn; rz /= rn; const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;
  const tv = Math.tan(l.fov * Math.PI / 360), th = tv * asp; const y0 = Sp.plinth(b).y0 + (p.levels.find(q => q.lv === lv) || { y: 0 }).y + 0.8;
  let n = 0, v = 0; for (let x = room.r[0] + 0.1; x < room.r[2]; x += 0.2) for (let z = room.r[1] + 0.1; z < room.r[3]; z += 0.2) { n++;
    const P = [b.x * TL + x, y0, b.y * TL + z]; const d = [P[0] - E[0], P[1] - E[1], P[2] - E[2]]; const df = d[0] * fx + d[1] * fy + d[2] * fz; if (df < 0.12) continue;
    const dr = d[0] * rx + d[2] * rz, du = d[0] * ux + d[1] * uy + d[2] * uz; if (Math.abs(dr / df) > th || Math.abs(du / df) > tv) continue;
    const L = Math.hypot(...d); let free = true; for (let s = 0.15; s < L - 0.3; s += 0.1) if (drawnAt(E[0] + d[0] / L * s, E[1] + d[1] / L * s, E[2] + d[2] / L * s)) { free = false; break; } if (free) v++; }
  return n ? v / n : 0;
}
const built = t => [...S().buildings.values()].filter(b => b.type === t && b.built && !b.ruin && In.has(b)).sort((a, c) => a.id - c.id);
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };

// ================================ o1: o terreiro ================================
if (want('o1')) {
  const res = []; let tot = 0, bad = 0;
  for (const b of [...built('taverna').slice(0, 5), ...built('olaria').slice(0, 4)]) {
    const p = Sp.planNow(b); if (!p || !p.ok || !p.shell.yard || !p.entrance) continue;
    const d = p.doors[p.entrance.door]; if (!d.rooms.some(r => { const m = p.rooms.find(q => q.id === r); return m && m.open; }) && !d.rooms.includes('rua')) continue;
    const mr = mainRoom(b, p); if (!mr) continue;
    watch(); const r = enter(b, { x: mr.x, z: mr.z, lv: mr.lv }); if (!r.ok) { unwatch(); continue; }
    frames(30, 'parado'); const R = unwatch();
    tot += R.n; bad += R.bad; res.push(`${b.type}#${b.id} ${R.bad}/${R.n}${R.first ? ' (' + R.first + ')' : ''}${r.walked ? '' : ' (PRESO)'}`);
    if (res.length >= 8) break;
  }
  ok('o1 o terreiro: da porta da rua até o salão, o olho nunca dentro do sólido', res.length >= 3 && bad === 0, `${res.length} prédios, ${bad} de ${tot} quadros com o olho errado · ${res.join(' · ')}`);
}

// ================================ o2: todo prédio ================================
if (want('o2')) {
  const types = new Map(); for (const b of [...S().buildings.values()].sort((a, c) => a.id - c.id)) { if (!b.built || b.ruin || !In.has(b) || types.has(b.type)) continue; const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance || p.shell.kind === 'aberta') continue; types.set(b.type, b); }
  const res = []; let tot = 0, bad = 0, n = 0; const worst = [];
  for (const [type, b] of types) {
    const p = Sp.planNow(b); const mr = mainRoom(b, p); if (!mr) continue;
    // (in by the door where the feet go in; where they do not — the steps only a jump takes, P4's measure —, put in the room)
    watch(); const r = enter(b, { x: mr.x, z: mr.z, lv: mr.lv }); if (!r.ok) { unwatch(); continue; }
    if (!Av.indoors()) { unwatch(); if (!placeIn(b, [mr.x, mr.z])) continue; watch(); }
    lookAround('gira'); const R = unwatch(); n++;
    tot += R.n; bad += R.bad; if (R.bad) worst.push(`${type}#${b.id} ${R.bad}/${R.n} (${R.first})`); res.push(`${type}${r.inside ? '' : '(posto)'}`);
  }
  ok('o2 todo prédio: entrando e girando o olho no maior cômodo, o olho nunca termina um quadro errado', n >= 15 && bad === 0, `${n} tipos (${res.join(' ')}), ${bad} de ${tot} quadros com o olho errado${worst.length ? ' · ' + worst.slice(0, 6).join(' · ') : ''}`);
}

// ================================ o3: a quarta parede ================================
if (want('o3')) {
  const rows = []; let bad = 0, tot = 0; const first = [];
  for (const asp of [PC, PHONE]) {
    CAM.aspect = asp;
    for (const t of ['taverna', 'house', 'insula', 'sobrado', 'paco']) for (const b of built(t).slice(0, 2)) {
      const p = Sp.planNow(b); if (!p || !p.ok) continue; const mr = mainRoom(b, p); if (!mr) continue; if (!placeIn(b, mr.pts[0])) continue;
      watch(); const vis = [];
      for (let k = 0; k < 8; k++) { C3.yaw = k * Math.PI / 4; frames(50, 'gira'); vis.push(seen(b, p, mr.m, mr.lv, asp)); }
      for (const q of [mr.pts[Math.floor(mr.pts.length * 0.9)], mr.pts[Math.floor(mr.pts.length * 0.5)], mr.pts[0]]) { walkTo(b.x * TL + q[0], b.y * TL + q[1], 'anda'); vis.push(seen(b, p, mr.m, mr.lv, asp)); }
      const R = unwatch(); bad += R.bad; tot += R.n; if (R.first) first.push(`${t}#${b.id}: ${R.first}`);
      const sc = R.cur.slice().sort((a, c) => a - c); rows.push({ asp, b: `${t}#${b.id}`, med: sc[Math.floor(sc.length / 2)], lt1: R.cur.filter(c => c < 1).length / R.cur.length, vis: vis.reduce((a, c) => a + c, 0) / vis.length, fov: C3.last.fov });
    }
  }
  CAM.aspect = PC;
  const avg = (asp, k) => { const rs = rows.filter(r => r.asp === asp); return rs.reduce((a, r) => a + r[k], 0) / Math.max(1, rs.length); };
  const fine = rows.length >= 12 && rows.every(r => r.med >= 4 && r.lt1 === 0) && avg(PC, 'vis') >= 0.6 && avg(PHONE, 'vis') >= 0.55 && bad === 0;
  ok('o3 a quarta parede: o olho na distância do jogador, nunca a menos de 1 m, e a sala à vista no PC e no celular em pé', fine,
    `${rows.length / 2} cômodos · o chão visto ${Math.round(100 * avg(PC, 'vis'))}% no PC e ${Math.round(100 * avg(PHONE, 'vis'))}% no celular (antes: 39% e 17%) · olho a menos de 1 m em ${Math.round(100 * avg(PC, 'lt1'))}% (antes: 46%) · ${rows.filter(r => r.asp === PC).map(r => `${r.b} ${r2(r.med)} m ${Math.round(100 * r.vis)}%`).join(', ')} · verificador ${bad}/${tot}${first.length ? ' — ' + first[0] : ''}`);
}

// ================================ o4: a porta sem salto ================================
if (want('o4')) {
  const res = []; let worst = 0, bad = 0, tot = 0;
  for (const t of ['house', 'taverna', 'insula', 'sobrado', 'temple', 'paco', 'armazem', 'biblioteca']) for (const b of built(t)) {
    const p = Sp.planNow(b); if (!p || !p.ok || !p.entrance) continue; const mr = mainRoom(b, p); if (!mr) continue;
    watch(); const r = enter(b, { x: mr.x, z: mr.z, lv: mr.lv }); if (!r.ok || !r.walked || !r.inside) { unwatch(); continue; }
    frames(20, 'dentro'); const In1 = unwatch();
    // (and out again: the eye behind the body — in the building — while the body walks out to the street)
    // (out by the same way — a way back that runs into the foot of a flight takes it, as a player pushing into it would: that
    // building is passed over, T-1763)
    watch(); const outOk = r.leave('sai') && !Av.indoors(); frames(40, 'rua'); const Out = unwatch(); if (!outOk) continue;
    const j = Math.max(In1.jump, Out.jump); worst = Math.max(worst, j); bad += In1.bad + Out.bad; tot += In1.n + Out.n;
    res.push(`${t}#${b.id} entra ${r2(In1.jump)} m · sai ${r2(Out.jump)} m${In1.bad + Out.bad ? ' (' + (In1.first || Out.first) + ')' : ''}`); break;
  }
  ok('o4 a porta sem salto: entrando e saindo pela porta, o olho nunca salta num quadro', res.length >= 5 && worst < 0.5 && bad === 0, `${res.length} prédios · o maior salto ${r2(worst)} m num quadro (antes: 4,2 a 4,8 m) · verificador ${bad}/${tot} · ${res.join(' · ')}`);
}

// ================================ o5: o quarteirão colado ================================
if (want('o5')) {
  const N = G.N; const res = []; let bad = 0, tot = 0, stopped = 0; const first = [];
  for (const t of ['house', 'insula', 'sobrado', 'taverna']) for (const b of built(t)) {
    if (res.length >= 8) break; const p = Sp.planNow(b); if (!p || !p.ok || p.shell.kind === 'round' || !p.shell.r) continue;
    // (a side of the lot along which another building of walls stands — against it, or across an alley of a tile or two: where the
    // eye, at the player's distance, would come to it. A building of walls: its plan made — in Node a building without one has no
    // body for the eye, the 3D's box is not here, T-1762 —; a garden or a field next door is open ground, over which the eye goes)
    let side = null; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { for (let gap = 1; gap <= 2 && !side; gap++) { let n = 0;
      for (let k = 0; k < b.w; k++) { const x = dx > 0 ? b.x + b.w - 1 + gap : dx < 0 ? b.x - gap : b.x + k, y = dy > 0 ? b.y + b.h - 1 + gap : dy < 0 ? b.y - gap : b.y + k; if (x < 0 || y < 0 || x >= N || y >= N) continue; const o = S().occ[y * N + x]; const ob = o && S().buildings.get(o);
        if (ob && ob.built && !ob.ruin && ob !== b && In.has(ob)) { const q = Sp.planNow(ob); if (q && q.ok && q.shell.kind !== 'aberta') n++; } }
      if (n * 2 >= b.w) side = [dx, dy]; } if (side) break; }
    if (!side) continue; const mr = mainRoom(b, p); if (!mr) continue;
    // (the point of the room nearest that side; the eye toward the neighbour)
    const at = mr.pts.slice().sort((a, c) => (c[0] * side[0] + c[1] * side[1]) - (a[0] * side[0] + a[1] * side[1]))[0];
    if (!placeIn(b, at, Math.atan2(-side[1], -side[0]))) continue;
    // (the eye drawn out to 9 m — the player's wheel goes to 16 —: past the street a neighbour of walls stands across, the planner
    // leaves no two houses wall to wall in the metropole)
    C3.dist = C3.OPT.dist = 9; watch(); C3.yaw = Math.atan2(-side[1], -side[0]); frames(80, 'vizinho'); for (let k = 0; k < 40; k++) { C3.yaw += 0.012 * Math.sin(k / 6); frame('vizinho'); }
    // (the eye: never in the neighbour's body, nothing of it between the eye and the body)
    const l = C3.last; const P = l.pos, H = l.piv; let through = false; const dd = Math.hypot(H[0] - P[0], H[1] - P[1], H[2] - P[2]);
    for (let s = 0.05; s < dd; s += 0.05) { const X = P[0] + (H[0] - P[0]) * s / dd, Y = P[1] + (H[1] - P[1]) * s / dd, Z = P[2] + (H[2] - P[2]) * s / dd; const i = Math.floor(Z / TL) * N + Math.floor(X / TL); if (S().occ[i] && S().occ[i] !== b.id && C3.solidAll(X, Y, Z)) { through = true; break; } }
    const R = unwatch(); bad += R.bad + (through ? 1 : 0); tot += R.n; if (R.first) first.push(R.first); if (through) first.push(`${t}#${b.id}: o vizinho entre o olho e o corpo`);
    if (l.cur < 8.8) stopped++; res.push(`${t}#${b.id} olho a ${r2(l.cur)} m`); C3.dist = C3.OPT.dist = 4.8;
  }
  ok('o5 o quarteirão colado: o vizinho para o olho, nunca o olho dentro dele nem ele entre o olho e o corpo', res.length >= 3 && bad === 0 && stopped >= 1, `${res.length} prédios colados, ${stopped} com o olho parado pelo vizinho · ${res.join(' · ')} · verificador ${bad}/${tot}${first.length ? ' — ' + first[0] : ''}`);
}

// ================================ o6: o save no meio ================================
if (want('o6')) {
  const b = built('taverna')[0]; const p = Sp.planNow(b); const mr = b && mainRoom(b, p); let r = null;
  if (mr && placeIn(b, mr.pts[0])) {
    C3.vista(true); frames(90, 'vista'); const before = { open: !!C3.open(), vista: C3.vistaOn(), cut: C3.cutBoxes().length };
    const vid = G.Possess.body().id; const snap = G.Save.serialize(); G.Save.apply(JSON.parse(snap));
    // (the game opened: the body lived again where it was — as Modes does after a load —, the eye from nothing)
    const v = S().villagers.get(vid); Av.detach(); const okT = v && take(v, 0); watch(); frames(60, 'depois'); const R = unwatch();
    r = { before, okT, vista: C3.vistaOn(), open: !!C3.open(), bad: R.bad, first: R.first, cur: r2(C3.last.cur) };
  }
  ok('o6 o save no meio: o olho de volta atrás do corpo, a vista desligada, o verificador limpo desde o primeiro quadro', !!r && r.before.open && r.before.vista && r.okT && !r.vista && r.open && r.bad === 0 && r.cur > 4, JSON.stringify(r));
}

// ================================ o7: a mira do arco ================================
if (want('o7')) {
  const res = []; let badN = 0, n = 0;
  for (const t of ['taverna', 'house', 'insula']) for (const b of built(t).slice(0, 2)) {
    const p = Sp.planNow(b); const mr = mainRoom(b, p); if (!mr || !placeIn(b, mr.pts[0])) continue;
    for (let k = 0; k < 4; k++) {
      C3.yaw = k * Math.PI / 2 + 0.3; frames(40, 'mira'); C3.aim(true); frames(40, 'mira'); n++;
      const ray = C3.aimRay(); const l = C3.last; const H = l.piv; const body = l.body;
      // (where the ray passes the body: the part from the eye to there only through what the cut takes away — nothing drawn —; and
      // where the aim meets what is drawn (C3.aimHit: what the reticle shows, where a shot would go) past the body, never a wall the
      // cut took away nor one behind it)
      const sBody = (H[0] - ray.from[0]) * ray.dir[0] + (H[1] - ray.from[1]) * ray.dir[1] + (H[2] - ray.from[2]) * ray.dir[2];
      let hidden = null; for (let s = 0.12; s < sBody - C3.CUT_NEAR; s += 0.05) { const X = ray.from[0] + ray.dir[0] * s, Y = ray.from[1] + ray.dir[1] * s, Z = ray.from[2] + ray.dir[2] * s; if (drawnAt(X, Y, Z)) { hidden = r2(s); break; } }
      const hit = C3.aimHit(40); const ahead = !hit || (hit.d >= sBody - C3.CUT_NEAR && !C3.inCut(hit.X, hit.Y, hit.Z)); void body;
      if (hidden !== null || !ahead) { badN++; res.push(`${t}#${b.id} rumo ${k}: ${hidden !== null ? 'parede sem o corte a ' + hidden + ' m do olho' : 'a mira bate antes do corpo, a ' + r2(hit.d) + ' m'}`); }
      C3.aim(false); frames(10, 'mira');
    }
  }
  ok('o7 a mira do arco: o raio passa pela parede só onde ela está cortada, e o que ele encontra fica à frente do corpo', n >= 16 && badN === 0, badN ? res.slice(0, 4).join(' · ') : `em ${n} miradas, nada sem o corte entre o olho e o corpo, e o alvo à frente`);
}

// ================================ o8: a vista da sala ================================
if (want('o8')) {
  const res = []; let fine = true;
  for (const t of ['taverna', 'house', 'paco']) { const b = built(t)[0]; const p = b && Sp.planNow(b); const mr = p && mainRoom(b, p); if (!mr || !placeIn(b, mr.pts[0])) continue;
    C3.yaw = 0.7; frames(60, 'antes'); const y0 = C3.yaw, p0 = C3.pitch, d0 = C3.last.cur;
    watch(); const on = C3.vista(); frames(120, 'vista'); const l = C3.last; const R1 = unwatch();
    const o = C3.open(); const tilt = Math.atan2(l.pos[1] - l.at[1], Math.hypot(l.at[0] - l.pos[0], l.at[2] - l.pos[2])) * 180 / Math.PI;
    const vis = seen(b, p, mr.m, mr.lv, PC);
    // (the room's floor corners in the lens)
    const E = l.pos, A = l.at; let fx = A[0] - E[0], fy = A[1] - E[1], fz = A[2] - E[2]; const fn = Math.hypot(fx, fy, fz); fx /= fn; fy /= fn; fz /= fn; let rx = fz, rz = -fx; const rn = Math.hypot(rx, rz) || 1; rx /= rn; rz /= rn; const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy; const tv = Math.tan(l.fov * Math.PI / 360), th = tv * PC;
    const corners = [[0, 1], [2, 1], [0, 3], [2, 3]].every(([i, j]) => { const P = [b.x * TL + mr.m.r[i], o.fy, b.y * TL + mr.m.r[j]]; const d = [P[0] - E[0], P[1] - E[1], P[2] - E[2]]; const df = d[0] * fx + d[1] * fy + d[2] * fz; return df > 0 && Math.abs((d[0] * rx + d[2] * rz) / df) <= th && Math.abs((d[0] * ux + d[1] * uy + d[2] * uz) / df) <= tv; });
    const high = l.pos[1] > o.fc + 0.3, kept = Math.abs(C3.yaw - y0) < 1e-9 && Math.abs(C3.pitch - p0) < 1e-9;
    watch(); const off = C3.vista(); frames(150, 'volta'); const R2 = unwatch(); const back = Math.abs(C3.last.cur - d0) < 0.3 && C3.last.pos[1] < o.fc + 2;
    const row = { t, on, olho: r2(l.cur), alto: r2(l.pos[1] - o.fc), inclinacao: Math.round(tilt), salaInteira: corners, chao: Math.round(100 * vis), rumoEInclinacao: kept, desliga: !off, volta: back, verificador: R1.bad + R2.bad, primeiro: R1.first || R2.first || undefined };
    if (!(on && high && tilt >= 44 && tilt <= 64 && corners && vis >= 0.8 && kept && !off && back && !R1.bad && !R2.bad)) fine = false; res.push(row);
  }
  // (out of the building, it ends; out of doors, it does not come on)
  let ends = null, outside = null; for (const b of [...built('house'), ...built('taverna')]) { const p = Sp.planNow(b); const m = mainRoom(b, p); if (!m) continue; const r = enter(b, { x: m.x, z: m.z, lv: m.lv });
    if (!r.ok || !r.walked || !r.inside) continue; C3.vista(true); frames(30, 'vista'); const was = C3.vistaOn(); if (!r.leave('sai') || Av.indoors()) continue; // (T-1763)
    frames(30, 'rua'); ends = was && !C3.vistaOn(); outside = C3.vista(true) === false && !C3.vistaOn(); break; }
  ok('o8 a vista da sala: o olho acima do teto cortado, a sala inteira de cima; de volta; o rumo e a inclinação do jogador intactos; sai, acaba; fora, não liga', fine && res.length >= 3 && ends && outside, `${JSON.stringify(res)} · ao sair acaba: ${ends} · fora de casa não liga: ${outside}`);
}

// ================================ o9: a lente pela tela ================================
if (want('o9')) {
  const b = built('taverna')[0]; const p = Sp.planNow(b); const mr = mainRoom(b, p); const across = (fov, asp) => 2 * Math.atan(Math.tan(fov * Math.PI / 360) * asp) * 180 / Math.PI;
  const out = {}; const v = grownUp(b); release(); fresh(v); v.inside = 0; const D = doorOut(b, p); const o0 = D.at(4); v.x = o0[0] / TL; v.y = o0[1] / TL;
  take(v, 0); CAM.aspect = PHONE; frames(200, 'rua'); out.celRua = [Math.round(C3.last.fov), Math.round(across(C3.last.fov, PHONE))];
  CAM.aspect = PC; frames(200, 'rua'); out.pcRua = Math.round(C3.last.fov);
  placeIn(b, mr.pts[0]); CAM.aspect = PC; const f0 = C3.last.fov; frames(18, 'entra'); out.pcEntra03 = r2(C3.last.fov - f0); frames(240, 'dentro'); out.pcDentro = Math.round(C3.last.fov);
  CAM.aspect = PHONE; frames(200, 'dentro'); out.celDentro = [Math.round(C3.last.fov), Math.round(across(C3.last.fov, PHONE))]; CAM.aspect = PC; frames(200, 'dentro');
  // (someone talking with the body, by it: the eye comes in — the lens stays)
  const me = G.Possess.body(); const o = grownUp(b, q => q.id !== me.id); fresh(o); o.inside = 0; o.x = me.x + 0.8 / TL; o.y = me.y; G.Vg.setTask(o, { type: 'talk', id: me.id, pri: 1.3, wait: 30 * Sp.TIME, kind: 'talk' }); frames(150, 'conversa');
  out.conversa = [Math.round(C3.last.fov), r2(C3.last.cur), !!C3.talking()]; G.Vg.endTask(o); frames(30, 'fim');
  ok('o9 a lente pela tela: nunca menos de 50° de lado; uns graus a mais dentro, devagar; a conversa dentro de casa não fecha a lente', out.celRua[1] >= 49.5 && out.pcRua === 58 && out.pcEntra03 < 2 && out.pcDentro === 58 + C3.IN_FOV && out.celDentro[1] >= 49.5 && out.conversa[0] >= 58 + C3.IN_FOV - 1, JSON.stringify(out));
}

// ================================ o10: o corpo contra os móveis ================================
if (want('o10')) {
  const res = []; let worst = 0, frN = 0, over = 0, stuck = 0, raw = 0;
  for (const t of ['taverna', 'house', 'paco']) for (const b of built(t).slice(0, 2)) {
    const p = Sp.planNow(b); const mr = mainRoom(b, p); if (!mr || !placeIn(b, mr.pts[0])) continue; const lv = mr.lv;
    // (straight at each piece of the room, from where the body is: the body pushed into the furniture as a player pushes)
    const items = p.items.filter(it => it.lv === lv && !it.niche && it.r[0] < mr.m.r[2] && it.r[2] > mr.m.r[0] && it.r[1] < mr.m.r[3] && it.r[3] > mr.m.r[1]);
    // (a flight the push runs into is taken — the body goes up it, along its own way —: that push ends there, and the body is put back)
    let w = 0; for (const it of items) { const X = b.x * TL + (it.r[0] + it.r[2]) / 2, Z = b.y * TL + (it.r[1] + it.r[3]) / 2; const st = Av.state(); let off = false;
      for (let k = 0; k < 150; k++) { const a = wrap(Math.atan2(Z - st.Z, X - st.X) - C3.yaw); IN.mz = Math.cos(a); IN.mx = Math.sin(a); frame('mesa'); if (st.loco !== 'ground' || st.lv !== lv) { off = true; break; } frN++; const d = Av.pieceDepth(st.X, st.Z); if (d > w) w = d; if (d > 0.02) over++; raw = Math.max(raw, Av.pieceDepth(st.X, st.Z, true)); }
      stop(); frames(10, 'mesa'); if (off) { if (!placeIn(b, mr.pts[0])) break; continue; }
      // (and straight away from it the body goes: it never sticks — then back where it began)
      const s0 = [st.X, st.Z]; for (let k = 0; k < 30; k++) { const a = wrap(Math.atan2(st.Z - Z, st.X - X) - C3.yaw); IN.mz = Math.cos(a); IN.mx = Math.sin(a); frame('larga'); }
      stop(); if (Math.hypot(st.X - s0[0], st.Z - s0[1]) < 0.15 && Av.pieceDepth(st.X, st.Z) > 0) stuck++; if (!placeIn(b, mr.pts[0])) break; }
    worst = Math.max(worst, w); res.push(`${t}#${b.id} ${items.length} peças, o pior ${r2(w)} m`);
  }
  ok('o10 o corpo contra os móveis: empurrado contra cada peça, o corpo nunca entra nela (o círculo dos ombros só onde a peça é mais baixa que o quadril), e sai de novo', res.length >= 4 && worst <= 0.02 && !over && !stuck, `${res.join(' · ')} (além da folga de cada peça) · o círculo dos ombros no mais fundo ${r2(raw)} m (a folga de uma mesa: ${Av.TUNE.pieceLow}) · ${over} de ${frN} quadros além da folga (antes: 17–19% dos quadros de um passeio a mais de 5 cm, o pior 0,19 m) · presos ao sair ${stuck}`);
}

// ================================ o11: só se vê ================================
if (want('o11')) {
  const b = built('taverna')[0]; const p = Sp.planNow(b); const mr = mainRoom(b, p); placeIn(b, mr.pts[0]);
  const snap = G.Save.serialize(); const vid = G.Possess.body().id;
  const life = (eye) => { G.Save.apply(JSON.parse(snap)); const v = S().villagers.get(vid); Av.detach(); take(v, 0); for (let k = 0; k < 200; k++) { if (eye && k === 40) C3.vista(true); if (eye && k === 120) C3.vista(false); IN.camYaw = C3.yaw; G.debug.step(RDT * Sp.TIME); Av.frame(RDT); if (eye) { C3.yaw += 0.02; const q = Av.pos(); if (q) C3.update(RDT, Object.assign({ h: 1.75 }, q), CAM); } } return hash(G.Save.serialize()); };
  const a = life(true), c = life(false);
  ok('o11 só se vê: o mesmo mundo vivido duas vezes, com o olho da quarta parede, o corte e a vista, e sem olho', a === c, a === c ? 'igual' : 'DIFERENTE');
}

// ================================ o12: o «Travar» ================================
if (want('o12')) {
  G.Modes.state = 'INC'; const res = {};
  const b = built('taverna')[0]; const p = Sp.planNow(b); const mr = mainRoom(b, p); const v = placeIn(b, mr.pts[0]); const st = Av.state();
  // (someone in the street, a metre and a half past a wall of the shell, straight ahead of the eye)
  const sh = p.shell.r; const X0 = b.x * TL, Z0 = b.y * TL; const walls = [[X0 + sh[0] - 1.6, st.Z], [X0 + sh[2] + 1.6, st.Z], [st.X, Z0 + sh[1] - 1.6], [st.X, Z0 + sh[3] + 1.6]].filter(q => G.W.walkableXY(q[0] / TL, q[1] / TL) && S().occ[Math.floor(q[1] / TL) * G.N + Math.floor(q[0] / TL)] !== b.id);
  const o = grownUp(b, q => q.id !== v.id); fresh(o); o.inside = 0;
  if (walls.length) { const q = walls[0]; o.x = q[0] / TL; o.y = q[1] / TL; o.downT = S().clock + 60; C3.yaw = Math.atan2(q[1] - st.Z, q[0] - st.X); frames(20, 'trava');
    o.x = q[0] / TL; o.y = q[1] / TL; res.rua = G.Modes.lockCandidate(true) === o; G.Vg.setTask(o, { type: 'combat', id: v.id, pri: 4.4, any: true, kind: 'combat' }); o.x = q[0] / TL; o.y = q[1] / TL; res.ruaHostil = G.Modes.lockCandidate(true) === o; G.Vg.endTask(o); }
  // (someone in the same room coming at the body: held; someone in it in peace: not)
  const q2 = mr.pts[Math.floor(mr.pts.length * 0.8)]; const put = () => { o.inside = b.id; o.x = b.x + q2[0] / TL; o.y = b.y + q2[1] / TL; o.downT = S().clock + 60; };
  put(); C3.yaw = Math.atan2(o.y * TL - st.Z, o.x * TL - st.X); frames(10, 'trava'); put(); res.salaPaz = G.Modes.lockCandidate(true) === o;
  G.Vg.setTask(o, { type: 'combat', id: v.id, pri: 4.4, any: true, kind: 'combat' }); put(); res.salaHostil = G.Modes.lockCandidate(true) === o; G.Vg.endTask(o);
  // (out of doors, in the open: as before — the one ahead)
  { release(); fresh(v); v.inside = 0; const D = doorOut(b, p); const a = D.at(6); v.x = a[0] / TL; v.y = a[1] / TL; take(v, Math.atan2(D.nz, D.nx)); C3.yaw = Math.atan2(D.nz, D.nx); frames(20, 'rua');
    o.inside = 0; o.x = v.x + Math.cos(C3.yaw) * 1.2; o.y = v.y + Math.sin(C3.yaw) * 1.2; o.downT = S().clock + 60; frames(2, 'rua'); o.x = v.x + Math.cos(C3.yaw) * 1.2; o.y = v.y + Math.sin(C3.yaw) * 1.2; res.foraAberto = G.Modes.lockCandidate(true) === o; }
  o.downT = 0; G.Modes.state = 'GOD';
  ok('o12 o «Travar»: nunca através da parede; dentro de casa só quem vem contra o corpo; fora, no aberto, quem está à frente', res.rua === false && res.ruaHostil === false && res.salaPaz === false && res.salaHostil === true && res.foraAberto === true && walls.length > 0, JSON.stringify(res));
}

// ================================ o13: a trama ================================
if (want('o13')) {
  // (out of doors, by the wall of a house, the eye toward it: pressed to the wall, at the head — the body in a weave; turned away, whole)
  const b = built('house').find(q => { const x = q.x - 1, y = q.y; return x > 0 && G.W.walkableXY(x + 0.5, y + 0.5) && G.W.walkableXY(x - 0.5, y + 0.5) && !S().occ[y * G.N + x] && !S().occ[y * G.N + x - 1]; });
  Sp.planNow(b); // (its plan made: the eye of the proof meets its walls — in Node the 3D's boxes of the buildings are not there)
  const v = grownUp(b); release(); fresh(v); v.inside = 0; v.x = b.x - 0.12; v.y = b.y + b.h / 2; take(v, Math.PI);
  C3.yaw = Math.PI; C3.pitch = 0.1; frames(60, 'parede'); const near = { cur: r2(C3.last.cur), fade: r2(C3.bodyFade()) };
  C3.yaw = 0; frames(200, 'longe'); const far = { cur: r2(C3.last.cur), fade: r2(C3.bodyFade()) }; C3.pitch = 0.26;
  ok('o13 a trama: o olho junto da cabeça põe o corpo em trama; longe, inteiro', near.fade > 0.3 && far.fade === 0, JSON.stringify({ junto: near, longe: far }));
}

// ================================ o14: a tela pelo lugar ================================
if (want('o14')) {
  const b = built('taverna')[0]; const p = Sp.planNow(b); const mr = mainRoom(b, p); const res = {};
  const v = [...S().villagers.values()].filter(o => o.age >= 20 && o.age < 50 && !o.inside && !o.aboard && G.Possess.can(o).ok).sort((a, c) => a.id - c.id).find(q => G.Combate.weapon(q).cls === 'punho' && !G.Combate.weapon(q).bow);
  release(); fresh(v); v.inside = b.id; v.x = b.x + mr.pts[0][0] / TL; v.y = b.y + mr.pts[0][1] / TL; take(v, 0); v.job = b.id; frames(30, 'sala');
  const IU = G.IncUI, In3 = G.Input3D; const btn = a => In3.BUTTONS.find(q => q.a === a);
  res.sobTeto = C3.under(); res.emPaz = !IU.fightNear(v); res.descansam = ['correr', 'esquivar', 'atacar', 'defender'].every(a => In3.CALM[a]); res.vistaBotao = !!btn('vista') && btn('vista').when();
  const o = grownUp(b, q => q.id !== v.id); fresh(o); o.inside = b.id; o.x = v.x + 1 / TL; o.y = v.y; G.Vg.setTask(o, { type: 'combat', id: v.id, pri: 4.4, any: true, kind: 'combat' }); res.briga = IU.fightNear(v); G.Vg.endTask(o); o.inside = 0;
  res.emPaz2 = !IU.fightNear(v);
  release(); fresh(v); v.inside = 0; const D = doorOut(b, p); const a = D.at(5); v.x = a[0] / TL; v.y = a[1] / TL; take(v, 0); frames(30, 'rua'); res.foraVista = !btn('vista').when(); res.fora = !C3.under();
  ok('o14 a tela pelo lugar: sob um teto e em paz o «Correr» e o trio da luta descansam e o botão da vista aparece; com uma briga voltam; fora, como antes', res.sobTeto && res.emPaz && res.descansam && res.vistaBotao && res.briga && res.emPaz2 && res.foraVista && res.fora, JSON.stringify(res));
}

const mod = Object.keys(G.modErr || {}); const er = M.erros(); ok('sem erro de módulo nem aviso no console', !mod.length && !er.console.length, mod.length ? mod.join(', ') : er.console.length ? er.console.slice(0, 2).join(' | ') : 'limpo');
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
