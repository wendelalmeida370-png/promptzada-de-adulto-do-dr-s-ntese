// movimento: o movimento do corpo (20b, D-355 a D-369) — em Node, sem navegador (a simulação do qa/nodemundo.js, com o controle do
// corpo, a câmera e as teclas por cima; quadros dirigidos à mão, como o main.js os dá):
//   node qa/movimento.js [mundo]          (padrão: o mundo pronto «metropole»; ONLY=m1,m4 roda só essas partes)
// As provas:
//   m1  a resposta: do aperto de uma tecla à primeira mudança de velocidade — no mesmo quadro, a 60, 144 e 30 quadros por segundo
//   m2  os passos: andar, trotar, disparar, cada um na sua velocidade; o bastão analógico (pouco empurrado anda, todo trota); o
//       andar devagar (Caps Lock); agachado mais baixo e mais devagar; dentro de casa se anda
//   m3  o fôlego sem piscar: a disparada segurada 40 s — gasta, acaba devagar (do disparar ao trote), descansa até uma parte e volta;
//       nenhuma troca entre disparar e não disparar a menos de 1,5 s da outra; o trote não cansa
//   m4  o rumo sem estalo: em qualquer quadro (60, 144, 30 e irregulares), o rumo desenhado nunca gira mais do que o giro do corpo
//       permite — andando a esmo, no giro de 180°, ao subir uma pedra com as mãos, ao ser derrubado, ao sentar e levantar
//   m5  o degrau sem salto: subindo e descendo uma pedra baixa (um degrau que o pé sobe), a altura desenhada nunca salta num
//       quadro e volta aos pés em meio segundo; onde os pés pisam é o chão do mundo
//   m6  nunca preso numa quina: uma volta pelas ruas de uma cidade pronta — de porta em porta pelo caminho do mundo, a câmera
//       virada para o ponto seguinte, como um jogador — sem parar; as quinas contornadas contadas
//   m7  a árvore e o poste: andando reto contra um tronco (no meio e de lado), o corpo passa por ele sem parar
//   m8  a borda só quando se pede: empurrando uma pedra alta o corpo não sobe; pulando junto dela, sobe com as mãos
//   m9  a esquiva: rolar, o passo de lado (mira travada) e o recuo, cada um com a sua distância, o seu fôlego e o seu tempo; contra
//       uma parede para nela e nunca entra; sem fôlego não sai; no ar não sai; e os casos ruins: o mundo leva o corpo no meio, o
//       save no meio, a pessoa morre no meio
//   m10 a mira travada: o corpo anda de lado em volta do alvo, virado para ele; o alvo some ou vai longe, a mira solta
//   m11 a câmera sem andar em círculo: segurando A (ou D) 8 s com o mouse parado, o rumo da câmera fica e o corpo anda reto; a
//       inclinação que o jogador escolheu fica; para a frente, a câmera vai devagar para as costas (a opção)
//   m12 as ações com movimento (JOGABILIDADE.md §4.5): o empurrão do gesto (drive) leva o corpo à frente sem atravessar parede; o
//       moveScale deixa andar devagar; as janelas (cancelAt) recusam outra ação fora delas; a esquiva corta onde pode
//   m13 o controle de jogo e o toque, pela conta: a zona morta, a curva, o bastão que trota, o botão que pula e o que esquiva
//   m14 o verificador limpo, sem erro de módulo
const path = require('path');
const M = require(path.join(__dirname, 'nodemundo.js'));
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'js/cam3d.js', 'js/input3d.js', 'qa/visual/corpo-qa.js'] });
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | movimento ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
M.pronto(process.argv[2] || 'metropole');
let S = G.S; const W = G.W, TL = G.Space.TILE, Av = G.Avatar, C3 = G.Cam3D, IN = Av.input, TU = Av.TUNE;
const wrap = a => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
const r2 = x => Math.round(x * 100) / 100;
// the frame, as the game's: the world's step of rdt × Space.TIME, the body's frame, the eye (a camera of the proof's own: the 3D is
// not drawn here), and the hands read back from the eye as Modes does
const CAM = { position: { set() { } }, lookAt() { }, updateProjectionMatrix() { }, fov: 58, near: 0.1, far: 1000 };
let camOn = true;
function frame(rdt) {
  rdt = rdt || 1 / 60; IN.camYaw = C3.yaw; IN.lock = C3.locked(); IN.aim = C3.aiming();
  G.debug.step(rdt * G.Space.TIME); Av.frame(rdt);
  const p = Av.pos(); if (p && camOn) C3.update(rdt, Object.assign({ h: 1.75 }, p), CAM);
}
const st = () => Av.state();
const stop = () => { IN.mx = 0; IN.mz = 0; IN.run = false; IN.walk = false; IN.jump = false; IN.dodge = false; IN.crouch = false; };
// (the verifier: what weighs, S0 to S2, against what the world had before the proof's hand)
let base = new Set(); const qk = e => e.id + '|' + e.msg.replace(/\s*\([^)]*\)\s*$/, '');
const vbad = () => QA.check().filter(q => q.sev <= 2 && !base.has(qk(q)));
// (the stage: the longest straight way of open ground three tiles wide the world has — no tree, no stone, no building, no water —,
// along x or along y; and a grown-up to be lived there)
function corridor() {
  const okT = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return !(!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.type[i] <= G.T.RIVER || S.slope[i] > 1.0 || S.wall[i] || S.road[i]); };
  const wide = (x, y, dx, dy) => okT(x, y) && okT(x - dy, y + dx) && okT(x + dy, y - dx);
  let best = 0, at = null;
  for (let y = 2; y < G.N - 2; y++) for (let x = 2; x < G.N - 2; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { let n = 0; while (wide(x + dx * n, y + dy * n, dx, dy)) n++; if (n > best) { best = n; at = { x, y, dx, dy, n }; } }
  return at;
}
const COR = corridor();
// (the sprint of the m3, T-1904: back and forth with the run-on past each turn — the corridor's ends are no shore. The longest corridor of
// the metropole began a tile from the sea, and the body sprinting out of breath ran on into it and drowned; the m4 then asked for a dead
// body; the same in the base before the T2, Dafne #7764 drowned five tiles to the side of the corridor, at (30,6, 53,3): the run turned
// at the ends and wandered off its line. A stretch of the corridor kind whose whole sprint — the strip and MARGEM tiles past each end,
// LADO more on each side — crosses no water, tile by tile by the world's own door, W.isWater; the longest such; and on it the sprint
// keeps to its line, the eye turned along it at each frame, as a player holds a straight run)
const MARGEM = 3, LADO = 2;
function corridorDry(m) {
  const okT = (x, y) => { if (!W.inb(x, y)) return false; const i = W.idx(x, y); return !(!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.type[i] <= G.T.RIVER || S.slope[i] > 1.0 || S.wall[i] || S.road[i]); };
  const wide = (x, y, dx, dy) => okT(x, y) && okT(x - dy, y + dx) && okT(x + dy, y - dx);
  const wet = (x, y) => !W.inb(x, y) || W.isWater(W.idx(x, y));
  const W2 = 1 + LADO; const runOn = (x, y, dx, dy, n) => { for (let k = -m; k < n + m; k++) for (let sd = -W2; sd <= W2; sd++) { if ((k >= 0 && k < n && Math.abs(sd) <= 1)) continue; if (wet(x + dx * k - dy * sd, y + dy * k + dx * sd)) return false; } return true; };
  let best = 0, at = null;
  for (let y = 2; y < G.N - 2; y++) for (let x = 2; x < G.N - 2; x++) for (const [dx, dy] of [[1, 0], [0, 1]]) { let n = 0; while (wide(x + dx * n, y + dy * n, dx, dy)) { n++; if (n > best && runOn(x, y, dx, dy, n)) { best = n; at = { x, y, dx, dy, n }; } } }
  return at;
}
const COR3 = corridorDry(MARGEM);
const A3 = COR3 ? [COR3.x + 0.5, COR3.y + 0.5] : null, YAW3 = COR3 ? Math.atan2(COR3.dy, COR3.dx) : 0;
const A0 = COR ? [COR.x + 0.5, COR.y + 0.5] : null, A1 = COR ? [COR.x + 0.5 + COR.dx * (COR.n - 1), COR.y + 0.5 + COR.dy * (COR.n - 1)] : null;
const YAW = COR ? Math.atan2(COR.dy, COR.dx) : 0;
const pick = k => [...S.villagers.values()].filter(o => o.age >= 20 && o.age < 45 && !(o.lost && o.lost.leg) && !(o.sick > 0) && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[k || 0];
function live(v, x, y, yaw) {
  // (a body the world killed in a part before — drowned, fallen —: the proof says who and how, and stops; it never lives a dead one, nor
  // another in silence: T-1904)
  if (!G.S.villagers.has(v.id)) { const d = G.S.dead.get(v.id); ok('o corpo vivo', false, `${v.name} #${v.id} morreu${d && d.cause ? ' (' + d.cause + ')' : ''} antes desta parte: a prova não vive um corpo morto (T-1904)`); console.log(`FALHOU: ${fails.join(', ')}`); process.exit(1); }
  if (G.Possess.body()) G.Possess.release('deus'); Av.detach();
  G.Vg.endTask(v); v.inside = 0; v.x = x; v.y = y; v.path = null; v.hp = 100; v.sleeping = false; v.downT = 0; v.hunger = 10; v.energy = 90; v.carry = null;
  const r = G.Possess.take(v); if (!r.ok) return false;
  Av.attach(v, yaw); stop(); C3.attach(Av.pos(), yaw); C3.unlock(); C3.aim(false); C3.pitch = 0.26;
  for (let k = 0; k < 4; k++) frame(); return true;
}
// (back and forth along the corridor: the eye turned back at each end, as a player turns)
const shuttleOf = (cor, a0, yaw, hold) => () => { const b = st(); const t = ((b.X / TL - a0[0]) * cor.dx + (b.Z / TL - a0[1]) * cor.dy); const fw = Math.cos(wrap(C3.yaw - yaw)) > 0; if (fw && t > cor.n - 1.8) C3.yaw = yaw + Math.PI; else if (!fw && t < 0.8) C3.yaw = yaw;
  // (holding the line: the eye along the corridor, turned a little back toward its middle line by how far off it the body is)
  if (hold) { const f = Math.cos(wrap(C3.yaw - yaw)) > 0 ? 1 : -1; const off = (b.X / TL - a0[0]) * -cor.dy + (b.Z / TL - a0[1]) * cor.dx; C3.yaw = (f > 0 ? yaw : yaw + Math.PI) - f * G.clamp(Math.atan(1.2 * off), -0.4, 0.4); } };
const shuttle = shuttleOf(COR, A0, YAW);
const shuttle3 = COR3 ? shuttleOf(COR3, A3, YAW3, true) : shuttle; // (the m3's: on the stretch with no water in its run-on, on its line)
let v0 = pick();
if (!COR || COR.n < 6 || !v0) { ok('palco', false, !COR ? 'nenhum corredor aberto' : !v0 ? 'ninguém para viver' : `o corredor mais longo tem ${COR.n} casas`); process.exit(1); }
base = new Set(QA.check().filter(e => e.sev <= 3).map(qk));
console.log(`(palco: corredor de ${COR.n} casas em ${COR.x},${COR.y} ${COR.dx ? 'ao longo de x' : 'ao longo de y'}; ${v0.name} #${v0.id})`);
if (COR3) console.log(`(a disparada da m3: corredor de ${COR3.n} casas em ${COR3.x},${COR3.y} ${COR3.dx ? 'ao longo de x' : 'ao longo de y'}, sem água ${MARGEM} casas além de cada ponta e ${LADO} de cada lado — T-1904)`);

// ================================ m1: a resposta ================================
if (want('m1')) {
  const out = [];
  for (const hz of [60, 144, 30]) {
    live(v0, A0[0], A0[1], YAW); for (let k = 0; k < 30; k++) frame(1 / hz);
    // (the key pressed as the browser gives it, through the action table to the axes, as Modes reads them each frame)
    const e = { key: 'w', preventDefault() { }, getModifierState: () => false };
    G.Input3D.key(e, true); const a = G.Input3D.axes(); IN.mx = a.mx; IN.mz = a.mz;
    let k = 0, t = 0; for (; k < 20; k++) { frame(1 / hz); t += 1 / hz; if (st().speed > 0.05) break; }
    G.Input3D.key({ key: 'w', preventDefault() { }, getModifierState: () => false }, false); const a2 = G.Input3D.axes(); stop(); IN.mz = a2.mz;
    out.push({ hz, quadros: k + 1, ms: Math.round(t * 1000), v: r2(st().speed) });
    for (let q = 0; q < 30; q++) frame(1 / hz);
  }
  // (the first velocity within a step of the body — 1/60 s — and the frame after it, at any frame rate)
  ok('m1 do aperto à primeira mudança de velocidade, em 60, 144 e 30 quadros por segundo', out.every(o => o.ms <= 1000 / 60 + 1000 / o.hz + 1 && o.v > 0.3), JSON.stringify(out));
}

// ================================ m2: os passos ================================
if (want('m2')) {
  live(v0, A0[0], A0[1], YAW); const P = Av.paces() || {};
  const top = (setup, n) => { stop(); setup(); let m = 0; for (let k = 0; k < (n || 150); k++) { shuttle(); frame(); if (k > 70 && !st().pivot) m = Math.max(m, st().speed); } stop(); for (let k = 0; k < 40; k++) frame(); return m; };
  const P1 = Av.paces();
  const walkK = top(() => { IN.mz = 1; IN.walk = true; }), jogK = top(() => { IN.mz = 1; }), sprintK = top(() => { IN.mz = 1; IN.run = true; }, 150);
  const a30 = top(() => { IN.mz = 0.3; }), a55 = top(() => { IN.mz = 0.55; }), a100 = top(() => { IN.mz = 1; });
  // (the crouch: one press down; slower and lower)
  stop(); IN.crouch = true; frame(); const cr = st().crouch; const crSp = top(() => { IN.mz = 1; }); const crK = st().crouch; IN.crouch = true; frame(); const up = !st().crouch;
  const g = (x, y, e) => Math.abs(x - y) <= y * (e || 0.08);
  ok('m2 andar, trotar e disparar, cada um na sua velocidade (as do corpo: Avatar.paces)', g(walkK, P1.walk) && g(jogK, P1.jog) && g(sprintK, P1.sprint, 0.1) && P1.jog > P1.walk * 1.5 && P1.sprint > P1.jog * 1.5,
    `andar ${r2(walkK)} (${r2(P1.walk)}) · trotar ${r2(jogK)} (${r2(P1.jog)}) · disparar ${r2(sprintK)} (${r2(P1.sprint)}) m/s`);
  ok('m2 o bastão analógico: pouco empurrado anda devagar, a meio anda, todo trota', a30 < P1.walk * 0.7 && g(a55, P1.walk, 0.1) && g(a100, P1.jog), `0,3 → ${r2(a30)} · 0,55 → ${r2(a55)} · 1 → ${r2(a100)} m/s`);
  ok('m2 agachar (alternar): mais baixo e mais devagar; a tecla de novo levanta', cr && crK && crSp < P1.walk * 0.6 && up, JSON.stringify({ agachou: cr, ficou: crK, vel: r2(crSp), levantou: up }));
  void P;
}

// ================================ m3: o fôlego sem piscar ================================
if (want('m3') && !COR3) ok('m3 o palco da disparada', false, `nenhum corredor sem água ${MARGEM} casas além das pontas e ${LADO} dos lados (T-1904)`);
if (want('m3') && COR3) {
  live(v0, A3[0], A3[1], YAW3); const b = st(); const max = b.caps.stamina;
  IN.mz = 1; IN.run = true; const ev = []; let was = false, winded = false, last = -9, flick = 0, gaps = [], minS = 1e9, k = 0, jogSt = null;
  for (; k < 60 * 40; k++) { shuttle3(); frame(); const sp = !!b.sprint; if (sp !== was) { const t = k / 60; if (t - last < 1.5) flick++; gaps.push(r2(t - last)); last = t; ev.push(`${t.toFixed(1)}:${sp ? 'dispara' : 'trota'}`); was = sp; } if (b.winded !== winded) { ev.push(`${(k / 60).toFixed(1)}:${b.winded ? 'sem fôlego' : 'recuperado'}`); winded = b.winded; } minS = Math.min(minS, b.stamina); }
  // (the jog alone: the breath does not go)
  IN.run = false; for (let q = 0; q < 60 * 6; q++) { shuttle3(); frame(); } const s0 = b.stamina; for (let q = 0; q < 60 * 10; q++) { shuttle3(); frame(); } jogSt = { de: r2(s0), para: r2(b.stamina) };
  stop(); for (let q = 0; q < 30; q++) frame();
  const cycles = ev.filter(e => /sem fôlego/.test(e)).length;
  ok('m3 a disparada gasta o fôlego, acaba devagar e só volta depois de descansar uma parte — sem piscar', cycles >= 1 && !flick && minS <= 0.5 && ev.some(e => /recuperado/.test(e)), `${ev.join(' ')}; trocas a menos de 1,5 s: ${flick}; o fôlego mais baixo ${r2(minS)} de ${max}`);
  ok('m3 o trote não cansa', jogSt.para >= jogSt.de - 0.5, JSON.stringify(jogSt));
}

// ================================ m4: o rumo sem estalo ================================
// (the drawn yaw, frame to frame, against the fastest the body turns: TUNE.turnSlow, 15 rad/s in a pivot — and a hair over)
const TOP = Math.max(TU.turnSlow, 15, 18) * 1.08;
function yawWatch() { let prev = null, worst = 0, at = ''; return { see(rdt, why) { const m = Av.motion(); if (!m) { prev = null; return; } if (prev && Math.hypot(m.X - prev.X, m.Z - prev.Z) < 0.8) { const r = Math.abs(wrap(m.yaw - prev.yaw)) / rdt; if (r > worst) { worst = r; at = why; } } prev = { X: m.X, Z: m.Z, yaw: m.yaw }; }, get worst() { return worst; }, get at() { return at; } }; }
if (want('m4')) {
  const res = [];
  // (wandering: the stick turned about by a rule of the proof — no chance —, at four frame rates, the last uneven)
  for (const [lab, rate] of [['60', () => 1 / 60], ['144', () => 1 / 144], ['30', () => 1 / 30], ['irregular', k => [1 / 60, 1 / 40, 1 / 144, 1 / 25, 1 / 90][k % 5]]]) {
    live(v0, A0[0], A0[1], YAW); const w = yawWatch();
    for (let k = 0; k < 600; k++) { const t = k / 60; IN.mz = Math.cos(t * 1.3); IN.mx = Math.sin(t * 2.1); IN.run = (k % 240) > 160; if (k % 97 === 0) C3.yaw += 2.6; const dt = rate(k); frame(dt); w.see(dt, `andando a esmo, ${lab}`); }
    stop(); res.push(`${lab}: ${r2(w.worst)}`);
    if (w.worst > TOP) ok(`m4 andando a esmo a ${lab} quadros`, false, `giro de ${r2(w.worst)} rad/s num quadro`);
  }
  // (the 180° at a run: the pivot)
  live(v0, A0[0], A0[1], YAW); { const w = yawWatch(); IN.mz = 1; IN.run = true; for (let k = 0; k < 90; k++) { frame(); w.see(1 / 60, 'na disparada'); } C3.yaw += Math.PI; let piv = false; for (let k = 0; k < 90; k++) { frame(1 / 144); if (st().pivot) piv = true; w.see(1 / 144, 'no giro de 180°'); } stop(); res.push(`giro de 180°: ${r2(w.worst)}${piv ? ' (com o pivô)' : ' (sem pivô!)'}`); if (w.worst > TOP || !piv) ok('m4 o giro de 180°', false, `${r2(w.worst)} rad/s, pivô ${piv}`); }
  // (knocked down by a big blow from the side: twisted round as it falls)
  live(v0, A0[0], A0[1], YAW); { const w = yawWatch(); for (let k = 0; k < 10; k++) frame(); const v = G.Possess.body(); Av.react(v, { amt: 30, big: true, from: [v.x + Math.cos(YAW + 1.6), v.y + Math.sin(YAW + 1.6)], cause: 'beast' }); for (let k = 0; k < 120; k++) { frame(1 / 144); w.see(1 / 144, 'derrubado'); } res.push(`derrubado: ${r2(w.worst)}`); if (w.worst > TOP) ok('m4 derrubado de lado', false, `${r2(w.worst)} rad/s`); }
  // (sitting down on the ground and getting up walking the other way)
  live(v0, A0[0], A0[1], YAW); { const w = yawWatch(); Av.sit(); for (let k = 0; k < 60; k++) { frame(); w.see(1 / 60, 'sentando'); } C3.yaw = YAW + 2.8; IN.mz = 1; for (let k = 0; k < 60; k++) { frame(1 / 144); w.see(1 / 144, 'levantando'); } stop(); res.push(`sentar e levantar: ${r2(w.worst)}`); if (w.worst > TOP) ok('m4 sentar e levantar', false, `${r2(w.worst)} rad/s`); }
  // (onto a boulder with the hands, from the side of it: the body turns to the ledge)
  { const rk = stoneOn(1.2, 2.2, 0); if (rk) { const ap = approach(rk, 2.6); live(v0, ap.x, ap.y, ap.yaw + 1.2); const w = yawWatch(); C3.yaw = ap.yaw; IN.mz = 1; let climbed = false; for (let k = 0; k < 400; k++) { if (st().block === 'ledge' && !climbed) IN.jump = true; frame(1 / 144); if (Av.climbing()) climbed = true; w.see(1 / 144, 'subindo a pedra'); } stop(); G.Nature.removeRock(rk); for (let k = 0; k < 4; k++) frame(); res.push(`subindo a pedra: ${r2(w.worst)}${climbed ? '' : ' (não subiu)'}`); if (w.worst > TOP || !climbed) ok('m4 subindo a pedra', false, `${r2(w.worst)} rad/s, subiu ${climbed}`); } else res.push('sem lugar para uma pedra'); }
  ok('m4 o rumo desenhado nunca gira mais do que o corpo gira (rad/s, no pior quadro)', !fails.some(f => /^m4 /.test(f)), `teto ${r2(TOP)} · ${res.join(' · ')}`);
}
// a boulder whose top stands between lo and hi metres over the ground, set by the proof's hand on open flat ground near the
// corridor (the feet stand on its faces: Space.stoneTop); null if none fits
// (a rock's stones: the big one, 1,7 m over the ground — climbed with the hands —, and beside it a small one of 0,57 m — stepped
// on, under a step's height: Space.stones; which: 0 the big, 1 the small)
// (where to start walking at a rock's stone, from dist metres off: on the far side of the big stone from the small one — or, for
// the small one, across it, its side away from the big one — and the way to walk)
function approach(rk, dist, which) {
  const L = G.Space.stones(rk); const B = L[0], s1 = L[1] || null; let ux = 1, uz = 0;
  if (s1) { ux = B.X - s1.X; uz = B.Z - s1.Z; const l = Math.hypot(ux, uz) || 1; ux /= l; uz /= l; }
  if (!which) return { x: (B.X + ux * dist) / TL, y: (B.Z + uz * dist) / TL, yaw: Math.atan2(-uz, -ux) };
  const px = -uz, pz = ux; return { x: (s1.X + px * dist) / TL, y: (s1.Z + pz * dist) / TL, yaw: Math.atan2(-pz, -px) };
}
function stoneOn(lo, hi, which) {
  const N = G.N; const fl = (x, y) => Av.floorAt((x + 0.5) * TL, (y + 0.5) * TL);
  // (open ground of the world round it, three tiles a side, flat to half a metre: the hilly ready worlds have few wider)
  const flat = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = (y + dy) * N + x + dx; if (!W.walkable(j) || S.occ[j] || S.treeAt[j] || S.objAt[j] || S.road[j] || S.wall[j] || S.type[j] <= G.T.RIVER) return false; } return Math.abs(fl(x - 1, y) - fl(x + 1, y)) < 0.5 && Math.abs(fl(x, y - 1) - fl(x, y + 1)) < 0.5; };
  for (let y = 4; y < N - 5; y++) for (let x = 4; x < N - 5; x++) { if (!flat(x, y) || !G.W.reaches(v0, x + 0.5, y + 0.5)) continue;
    const rk = G.Nature.addRock(x + 0.5, y + 0.5, 40); if (!rk) continue; const L = G.Space.stones(rk); const s0 = L[Math.min(L.length - 1, which || 0)];
    const top = G.Space.stoneTop(s0.X, s0.Z) - W.hAt(s0.X / TL, s0.Z / TL) * G.Space.HM; if (top >= lo && top <= hi && (!which || L.length > 1)) { rk.at = s0; return rk; } G.Nature.removeRock(rk); }
  return null;
}

// ================================ m5: o degrau sem salto ================================
if (want('m5')) {
  const rk = stoneOn(0.3, 0.59, 1);
  if (!rk) ok('m5 o degrau sem salto de altura desenhada', true, 'nenhum lugar para uma pedra baixa (nada a provar)');
  else {
    const s0 = rk.at; const top = G.Space.stoneTop(s0.X, s0.Z) - W.hAt(s0.X / TL, s0.Z / TL) * G.Space.HM;
    const ap = approach(rk, 2.4, 1); live(v0, ap.x, ap.y, ap.yaw); C3.yaw = ap.yaw; IN.mz = 0.6; // (at a walk across it, over and down the other side)
    let jumpPh = 0, jumpDr = 0, prevM = null, steps = 0, lagMax = 0, back = 1e9, feetOff = 0, k = 0, onTop = 0;
    for (; k < 220; k++) {
      frame(); const m = Av.motion(); const b = st();
      if (Math.abs(b.Y - Av.floorAt(b.X, b.Z)) > 0.02 && b.ground) feetOff++;
      if (prevM) { const dP = Math.abs(m.floorY - prevM.floorY), dD = Math.abs(m.Y - prevM.Y); if (dP > 0.06) { steps++; jumpPh = Math.max(jumpPh, dP); back = 0; } jumpDr = Math.max(jumpDr, dD); }
      if (back < 1e9) { back++; if (Math.abs(m.yOff) < 0.02 && back > 1) { lagMax = Math.max(lagMax, back); back = 1e9; } }
      if (G.Space.stoneTop(b.X, b.Z) > W.hAt(b.X / TL, b.Z / TL) * G.Space.HM + 0.1) onTop++;
      prevM = { Y: m.Y, floorY: m.floorY };
    }
    stop(); G.Nature.removeRock(rk); for (let q = 0; q < 4; q++) frame();
    // (a step of the feet of up to the stone's height in one step of the body; the drawn height at most a fifth of it a frame — and back on the feet in 0,5 s)
    ok('m5 o degrau sem salto de altura desenhada: os pés sobem no mundo, o desenho numa curva curta', steps >= 1 && onTop > 3 && jumpDr <= Math.max(0.07, jumpPh * 0.35) && lagMax <= 30 && !feetOff,
      `pedra de ${r2(top)} m: ${steps} degraus nos pés (o maior ${r2(jumpPh)} m num passo), a altura desenhada no máximo ${r2(jumpDr)} m num quadro, de volta aos pés em ${lagMax} quadros; em cima ${onTop}; pés fora do chão ${feetOff}`);
  }
}

// ================================ m6: nunca preso numa quina ================================
if (want('m6')) {
  // (the town with the most doors; a round of doors far apart the feet reach, by the world's own path — straight legs as a player
  // walks them, the eye turned to each next point; gates and water left out: only the streets and the corners)
  const towns = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id));
  const s = towns[0]; const doors = [...S.buildings.values()].filter(b => b.set === s.id && b.built && !b.ruin).map(b => G.Vg.door(b)).filter(d => d && W.walkableXY(d[0], d[1]));
  const v = G.Possess.body() || v0; const x0 = doors[0]; live(v0, x0[0], x0[1], 0);
  let walked = 0, stalls = 0, legs = 0, frames = 0, corners0 = st().corner || 0, worst = '', fell = 0, inWall = 0, jumps = 0, wallAt = '', wet = 0;
  const order = doors.slice(1).sort((a, b) => (a[0] * 31 + a[1] * 17) % 53 - (b[0] * 31 + b[1] * 17) % 53);
  for (const d of order) {
    if (legs >= 10 || walked > 900) break;
    const b = G.Possess.body(); if (G.dist(b.x, b.y, d[0], d[1]) < 8) continue;
    const p = W.findPath(b.x, b.y, d[0], d[1], true, 30000); if (!p || !p.length) continue;
    // (no leg through a gate of a wall: the body's own way through its passage is the estiva's, not this proof's)
    if (p.some(q => S.wall[W.idx(q[0], q[1])])) continue;
    legs++; let i = 0, still = 0, last = [b.x, b.y];
    for (let k = 0; k < 2400; k++) {
      const w = p[Math.min(i, p.length - 1)]; const dx = w[0] - b.x, dy = w[1] - b.y; if (Math.hypot(dx, dy) < 0.35) { if (i >= p.length - 1) break; i++; continue; }
      // (a ledge squarely in the way — the world walks across a plinth the feet do not step up —: a player jumps at it, D-360)
      if (st().block === 'ledge' && still === 12) { IN.jump = true; jumps++; }
      C3.yaw = Math.atan2(dy, dx); IN.mz = 1; IN.mx = 0; IN.run = k % 300 > 200; frame(); frames++;
      // (inside what one does not tread: a building, a wall, a cliff — G.Space.surface, the body's own rule —, past what a building's
      // plan lets it stand on, a doorstep, the steps: G.Possess.onPlan, as m9 counts it; the first spot said. The water is not a
      // solid: a straight leg between two points of the world's way can cut a hand into a river's corner, where a player wades and
      // the world pulls the body out (the verifier's rule) — counted apart, T-1396)
      { const sf = G.Space.surface(b.x * TL, b.y * TL);
        if (!sf.walk && !G.Possess.onPlan(b)) { if (sf.kind === 'deep') wet++; else if (!inWall++) { const ob = S.occ[sf.i] && S.buildings.get(S.occ[sf.i]); wallAt = ` (o primeiro em ${b.x.toFixed(2)},${b.y.toFixed(2)}: ${ob ? ob.type + '#' + ob.id : sf.kind})`; } } }
      const m = G.dist(b.x, b.y, last[0], last[1]) * TL; walked += m; last = [b.x, b.y];
      if (m < 0.004) { if (++still === 45) { stalls++; worst = `${s.name}: parado em ${b.x.toFixed(2)},${b.y.toFixed(2)} indo a ${w[0].toFixed(1)},${w[1].toFixed(1)} (${st().block || '-'})`; } } else still = 0;
      if (still > 120) break;
      if (st().loco === 'air' && !st().jumpT) fell++;
    }
    stop(); for (let q = 0; q < 10; q++) frame();
  }
  const corners = (st().corner || 0) - corners0;
  ok('m6 uma volta pelas ruas de uma cidade pronta sem parar numa quina', legs >= 4 && walked > 250 && !stalls && !inWall, `${legs} trechos, ${Math.round(walked)} m em ${(frames / 60).toFixed(0)} s; paradas ${stalls}${worst ? ' — ' + worst : ''}; quinas contornadas ${corners}; pulos numa borda ${jumps}; dentro do que não se pisa ${inWall}${wallAt}; na água de uma margem ${wet}`);
  void v; void fell;
}

// ================================ m7: a árvore e o poste ================================
if (want('m7')) {
  // (a grown tree with open ground round it; the body walked straight at its trunk — at the middle, and a hand to the side)
  // (the ways to it and past it — 2,2 tiles before, 0,8 after, a hand to each side — open ground the world walks, no other tree)
  let tr = null; const lineOK = (t, yaw) => { for (let d = -2.4; d <= 1; d += 0.1) for (const o of [-0.12, 0, 0.12]) { const x = t.x + Math.cos(yaw) * d - Math.sin(yaw) * o, y = t.y + Math.sin(yaw) * d + Math.cos(yaw) * o; if (!W.inb(x, y)) return false; const j = W.idx(x, y); if (!W.walkable(j) || S.occ[j] || (S.treeAt[j] && S.treeAt[j] !== t.id) || S.objAt[j] || S.type[j] <= G.T.RIVER) return false; } return true; };
  for (const t of S.trees.values()) { if (!G.Space.trunk(t)) continue; if (lineOK(t, 0) && lineOK(t, Math.PI / 2) && G.W.reaches(v0, t.x - 2.2, t.y)) { tr = t; break; } }
  if (!tr) ok('m7 a árvore no caminho', true, 'nenhuma árvore aberta em volta (nada a provar)');
  else {
    const out = [];
    for (const off of [0, 0.12, -0.3]) for (const yaw of [0, Math.PI / 2]) {
      const X0 = tr.x - Math.cos(yaw) * 2.2 - Math.sin(yaw) * off / TL, Y0 = tr.y - Math.sin(yaw) * 2.2 + Math.cos(yaw) * off / TL;
      // (and no beast at the trunk: the proof is the tree's — a beast standing by it in the metropole made after the merge stopped the
      // body 178 frames, «blk: beast», a stop the world's rule makes: T-1397)
      { let n = 0; for (const a of [...S.animals.values()]) if (G.dist(a.x, a.y, tr.x, tr.y) < 4) { G.Animals.remove(a); n++; } if (n) G.debug.step(0.3); }
      if (!W.walkableXY(X0, Y0)) continue; live(v0, X0, Y0, yaw); C3.yaw = yaw; IN.mz = 1; let k = 0, still = 0, worst = 0; const b = st();
      for (; k < 400; k++) { frame(); const along = (b.X / TL - tr.x) * Math.cos(yaw) + (b.Z / TL - tr.y) * Math.sin(yaw); if (along > 0.5) break; if (b.speed < 0.3) still++; else still = 0; worst = Math.max(worst, still); }
      // (against the time of the same way with nothing in it, at the jog: what the tree cost)
      const free = 2.7 * TL / Math.max(0.1, (Av.paces() || {}).jog || 3); stop(); out.push({ off, yaw: r2(yaw), passou: k < 400, s: r2(k / 60), livre: r2(free), parado: worst });
    }
    ok('m7 andando reto contra um tronco, o corpo passa por ele sem parar (no meio e de lado), perdendo menos de 1,2 s', out.length && out.every(o => o.passou && o.parado < 20 && o.s < o.livre + 1.2), JSON.stringify(out));
  }
}

// ================================ m8: a borda só quando se pede ================================
if (want('m8')) {
  const rk = stoneOn(1.0, 2.4, 0);
  if (!rk) ok('m8 a borda só quando se pede', true, 'nenhum lugar para uma pedra alta (nada a provar)');
  else {
    const ap = approach(rk, 3); live(v0, ap.x, ap.y, ap.yaw); C3.yaw = ap.yaw; IN.mz = 1; let climbF = 0, k = 0;
    for (; k < 150; k++) { frame(); if (Av.climbing()) climbF++; }
    const pushed = climbF; const blocked = st().block;
    IN.jump = true; let after = 0, top = -9; for (k = 0; k < 120; k++) { frame(); if (Av.climbing()) after++; else if (st().ground) top = Math.max(top, st().Y - W.hAt(st().X / TL, st().Z / TL) * G.Space.HM); }
    stop(); G.Nature.removeRock(rk); for (let q = 0; q < 4; q++) frame();
    ok('m8 empurrando a pedra 2,5 s o corpo não sobe; pulando junto dela, sobe com as mãos (e anda por cima)', !pushed && after > 5 && top > 0.8, JSON.stringify({ empurrando: pushed, bloqueado: blocked, pulando: after, em_cima: r2(top) }));
  }
}

// ================================ m9: a esquiva ================================
if (want('m9')) {
  const D = (setup, n) => { live(v0, A0[0] + COR.dx * 3, A0[1] + COR.dy * 3, YAW); const b = st(); setup && setup(); frame(); const x0 = b.X, z0 = b.Z, s0 = b.stamina; IN.dodge = true; let kinds = new Set(), t = 0, k = 0, face = 0;
    for (; k < (n || 60); k++) { frame(); if (b.dodge) { kinds.add(b.dodge.kind); t += 1 / 60; if (IN.lock) face = Math.max(face, Math.abs(wrap(b.yaw - Math.atan2(IN.lock.Z - b.Z, IN.lock.X - b.X)))); } }
    const r = { kind: [...kinds].join(','), m: r2(Math.hypot(b.X - x0, b.Z - z0)), s: r2(t), custo: r2(s0 - b.stamina), face: r2(face) }; stop(); C3.unlock(); return r; };
  const roll = D(() => { IN.mz = 1; frame(); IN.mz = 0; for (let k = 0; k < 40; k++) frame(); IN.mz = 1; });
  const back = D(() => { });
  const side = D(() => { const b = st(); C3.lockOn({ X: b.X + Math.cos(YAW) * 6, Y: b.Y + 1.2, Z: b.Z + Math.sin(YAW) * 6 }); for (let k = 0; k < 30; k++) frame(); IN.mx = 1; IN.mz = 0; });
  ok('m9 rolar, o passo de lado (mira travada) e o recuo: cada um com a sua distância, o seu fôlego e o seu tempo', roll.kind === 'rolar' && roll.m > 2.2 && roll.custo >= TU.rollCost - 1 && back.kind === 'recuo' && back.m > 1.0 && back.m < 2.2 && side.kind === 'passo' && side.m > 1.1 && side.face < 0.5,
    JSON.stringify({ rolar: roll, recuo: back, passo: side }));
  // (into a wall: the dodge stops at it and never goes in — a building's wall near the town)
  { const v = v0; const B = [...S.buildings.values()].find(q => q.built && q.w <= 3 && W.walkableXY(q.x - 1 + 0.5, q.y + Math.floor(q.h / 2) + 0.5) && G.W.reaches(v, q.x - 0.5, q.y + Math.floor(q.h / 2) + 0.5));
    if (B) { live(v, B.x - 0.5 - 0.5, B.y + Math.floor(B.h / 2) + 0.5, 0); C3.yaw = 0; let bad = 0; IN.mz = 1; frame(); IN.dodge = true; for (let k = 0; k < 60; k++) { frame(); const b = G.Possess.body(); if (!W.walkableXY(b.x, b.y) && !G.Possess.onPlan(b)) bad++; } stop();
      ok('m9 a esquiva contra uma parede para nela e nunca entra', !bad, `${B.type}#${B.id}: quadros dentro ${bad}`); } }
  // (no breath: no dodge; in the air: none until the feet are down; one after another: the moment between them)
  { live(v0, A0[0] + COR.dx * 3, A0[1] + COR.dy * 3, YAW); const b = st(); b.stamina = 3; IN.mz = 1; IN.dodge = true; let k = 0, any = false; for (; k < 20; k++) { frame(); if (b.dodge) any = true; } stop(); for (let q = 0; q < 30; q++) frame();
    b.stamina = 100; IN.jump = true; frame(); IN.dodge = true; frame(); const inAir = !!b.dodge; for (let q = 0; q < 60; q++) frame();
    IN.mz = 1; IN.dodge = true; frame(); for (let q = 0; q < 60 && b.dodge; q++) frame(); IN.dodge = true; frame(); const cd = !!b.dodge; for (let q = 0; q < 40; q++) frame(); stop();
    ok('m9 sem fôlego não sai; no ar não sai; uma logo atrás da outra espera o seu momento', !any && !inAir && !cd, JSON.stringify({ semFolego: any, noAr: inAir, colada: cd })); }
  // (the bad cases: the world takes the body in the middle; saved and loaded in the middle; the person dies in the middle)
  { live(v0, A0[0] + COR.dx * 3, A0[1] + COR.dy * 3, YAW); const b = st(); IN.mz = 1; frame(); IN.dodge = true; frame(); frame(); const was = !!b.dodge; const took = Av.place(A0[0], A0[1]); frame(); const gone = took && !b.dodge && b.loco === 'ground'; // (to the corridor's start, three tiles back: six ahead was past the end of the six-tile corridor of the metropole made after the merge, and Avatar.place moved nobody, T-1395)
    IN.mz = 1; frame(); IN.dodge = true; frame(); frame(); const was2 = !!st().dodge; const n = M.salvarCarregar(); S = G.S; v0 = S.villagers.get(v0.id); const v1 = G.Possess.body(); let after = null; if (v1) { Av.attach(v1, YAW); C3.attach(Av.pos(), YAW); for (let q = 0; q < 30; q++) frame(); after = { dodge: !!st().dodge, chao: W.walkableXY(v1.x, v1.y), loco: st().loco }; }
    // (the one who dies is another than the stage's body: the parts after this one live on with it)
    const vd = pick(1); live(vd, A0[0] + COR.dx * 3, A0[1] + COR.dy * 3, YAW); const v2 = G.Possess.body(); if (v2) { IN.mz = 1; frame(); IN.dodge = true; frame(); frame(); } const was3 = !!(st() && st().dodge);
    if (v2) { G.Possess.apply(w => { G.Vg.damage(w, 999, 'beast', false); return { ok: true }; }); for (let q = 0; q < 10; q++) frame(); }
    const dead = v2 && !G.S.villagers.has(v2.id);
    ok('m9 os casos ruins: o mundo leva o corpo no meio, o save no meio, a pessoa morre no meio', was && gone && was2 && n > 0 && after && !after.dodge && after.chao && was3 && dead && !G.Possess.body(), JSON.stringify({ levado: { na: was, moveu: took, depois: gone }, save: { na: was2, depois: after }, morte: { na: was3, morta: dead, corpo: !!G.Possess.body() } }));
  }
}

// ================================ m10: a mira travada ================================
if (want('m10')) {
  const v = pick(); live(v, (A0[0] + A1[0]) / 2, (A0[1] + A1[1]) / 2, YAW); const b = st();
  // (a target: someone of the world put by the proof's hand six metres ahead, held still)
  const o = [...S.villagers.values()].find(q => q !== v && q.age > 16 && !q.inside && !q.aboard && !q.held && G.Possess.can(q).ok);
  G.Vg.endTask(o); o.x = v.x + Math.cos(YAW) * 1.5; o.y = v.y + Math.sin(YAW) * 1.5; o.path = null; G.Vg.setTask(o, { type: 'idle', pri: 9, wait: 60 }); frame();
  const lockedOn = C3.lockOn(o); let face = 0, d0 = null, dmin = 1e9, dmax = 0, strafe = 0, k = 0;
  IN.mx = 1; IN.mz = 0; // (to the right of the eye, held: the body steps round the target)
  const ox = o.x, oy = o.y; // (held where the proof put it: the world's step would walk it off)
  for (; k < 60 * 5; k++) { o.x = ox; o.y = oy; o.path = null; frame(); const t = C3.locked(); if (!t) break; const d = Math.hypot(t.X - b.X, t.Z - b.Z); if (k > 40) { d0 = d0 || d; dmin = Math.min(dmin, d); dmax = Math.max(dmax, d); face = Math.max(face, Math.abs(wrap(b.yaw - Math.atan2(t.Z - b.Z, t.X - b.X)))); if (b.strafe) strafe++; } }
  const turned = wrap(C3.yaw - YAW);
  stop();
  // (the target gone: indoors, or too far)
  o.inside = 1; frame(); frame(); const let1 = !C3.locked(); o.inside = 0;
  C3.lockOn(o); o.x = v.x + 40; o.y = v.y; frame(); frame(); const let2 = !C3.locked();
  ok('m10 o corpo anda de lado em volta do alvo, virado para ele; a câmera o segue', lockedOn && k >= 299 && face < 0.35 && strafe > 200 && Math.abs(turned) > 0.5, JSON.stringify({ travou: lockedOn, quadros: k, rumo_pior: r2(face), de_lado: strafe, distancia: [r2(dmin), r2(dmax)], camera_girou: r2(turned) }));
  ok('m10 o alvo some (entra num prédio) ou vai longe: a mira solta', let1 && let2, JSON.stringify({ dentro: let1, longe: let2 }));
  // (the aim over the shoulder — the bow of the second wave: the eye close and over the shoulder, the lens narrower, the body turned to
  // where the eye looks while it steps sideways; the ray through the middle of the picture; let go, all back)
  live(v, (A0[0] + A1[0]) / 2, (A0[1] + A1[1]) / 2, YAW); C3.yaw = YAW + 0.8; for (let q = 0; q < 30; q++) frame(); const fov0 = CAM.fov, d0a = C3.last.cur;
  C3.aim(true); IN.mx = 1; let faceA = 0; for (let q = 0; q < 90; q++) { frame(); if (q > 40) faceA = Math.max(faceA, Math.abs(wrap(st().yaw - C3.yaw))); }
  const aimed = { perto: r2(C3.last.cur), ombro: r2(Math.abs(C3.last.sh)), lente: r2(CAM.fov), rumo: r2(faceA), deLado: st().strafe, raio: !!C3.aimRay() };
  C3.aim(false); stop(); for (let q = 0; q < 120; q++) frame(); const back = { perto: r2(C3.last.cur), lente: r2(CAM.fov), deLado: st().strafe };
  ok('m10 a mira por cima do ombro: o olho perto e sobre o ombro, a lente fechada, o corpo virado para onde o olho olha andando de lado; solta, tudo volta', aimed.perto < 2.1 && aimed.perto < d0a && aimed.ombro > 0.4 && aimed.lente < fov0 - 6 && aimed.rumo < 0.2 && aimed.deLado && aimed.raio && !back.deLado && back.lente > fov0 - 1.5 && back.perto > aimed.perto + 0.5,
    JSON.stringify({ antes: { perto: r2(d0a), lente: r2(fov0) }, mirando: aimed, depois: back }));
}

// ================================ m11: a câmera sem andar em círculo ================================
if (want('m11')) {
  const res = {};
  for (const side of [1, -1]) {
    live(v0, (A0[0] + A1[0]) / 2, (A0[1] + A1[1]) / 2, YAW + Math.PI / 2 * side); C3.yaw = YAW + (side > 0 ? -Math.PI / 2 : Math.PI / 2); C3.pitch = 0.62; const y0 = C3.yaw; const b = st(); const p0 = [b.X, b.Z]; let len = 0, last = [b.X, b.Z];
    IN.mx = side; for (let k = 0; k < 60 * 6; k++) { frame(); len += Math.hypot(b.X - last[0], b.Z - last[1]); last = [b.X, b.Z]; }
    stop(); for (let k = 0; k < 20; k++) frame();
    res[side > 0 ? 'D' : 'A'] = { camera: r2(wrap(C3.yaw - y0)), reto: r2(Math.hypot(b.X - p0[0], b.Z - p0[1]) / Math.max(0.01, len)), m: r2(len), inclinacao: r2(C3.pitch) };
  }
  // (straight ahead, the mouse left alone: the eye swings gently behind the body — the option of the menu)
  live(v0, A0[0], A0[1], YAW); C3.yaw = YAW + 0.5; const pitch0 = C3.pitch; IN.mz = 1; IN.mx = -0.08; for (let k = 0; k < 60 * 5; k++) { shuttle(); frame(); } const fw = { camera_atras: r2(Math.abs(wrap(C3.yaw - st().yaw))), inclinacao: r2(C3.pitch - pitch0) }; stop();
  const fine = q => Math.abs(q.camera) < 0.05 && q.reto > 0.95 && Math.abs(q.inclinacao - 0.62) < 0.005;
  ok('m11 segurando A ou D 6 s com o mouse parado: a câmera fica, o corpo anda reto, a inclinação do jogador fica', fine(res.A) && fine(res.D), JSON.stringify(res));
  ok('m11 para a frente com o mouse parado a câmera não briga (e a inclinação fica)', Math.abs(fw.inclinacao) < 0.005, JSON.stringify(fw));
}

// ================================ m12: as ações com movimento ================================
if (want('m12')) {
  live(v0, A0[0] + COR.dx * 1.5, A0[1] + COR.dy * 1.5, YAW); const b = st(); const x0 = b.X, z0 = b.Z;
  // (a lunge: 1,5 m in 0,5 s by the gesture's own push, the feet the player's at a fifth)
  Av.act({ anim: 'swing', dur: 0.5, drive: [[0, 4.5], [0.6, 3], [1, 0]], face: YAW });
  for (let k = 0; k < 40; k++) frame();
  const lunge = r2(Math.hypot(b.X - x0, b.Z - z0));
  const x1 = b.X, z1 = b.Z; Av.act({ anim: 'interact', dur: 1.5, moveScale: 0.3, turn: 3 }); IN.mz = 1; for (let k = 0; k < 60; k++) frame(); const slow = r2(Math.hypot(b.X - x1, b.Z - z1)); stop(); for (let k = 0; k < 40; k++) frame();
  // (windows: an act that can be cut only in its last third — another act before it is refused, a dodge is not taken; after, both)
  Av.act({ anim: 'swing', dur: 1.2, cancelAt: [[0.66, 1]] }); frame(); const ref = Av.act({ anim: 'wave', dur: 1 }) === false; IN.dodge = true; frame(); const noDodge = !b.dodge; stop();
  for (let k = 0; k < 50; k++) frame(); IN.mz = 1; IN.dodge = true; frame(); const cut = !!b.dodge || !Av.busy(); stop(); for (let k = 0; k < 60; k++) frame();
  // (into a wall: the lunge stops at it)
  const B = [...S.buildings.values()].find(q => q.built && q.w <= 3 && W.walkableXY(q.x - 1 + 0.5, q.y + Math.floor(q.h / 2) + 0.5) && G.W.reaches(v0, q.x - 0.5, q.y + Math.floor(q.h / 2) + 0.5)); let wall = null;
  if (B) { live(v0, B.x - 0.5, B.y + Math.floor(B.h / 2) + 0.5, 0); let bad = 0; Av.act({ anim: 'swing', dur: 0.8, drive: [[0, 6], [1, 6]], face: 0 }); for (let k = 0; k < 60; k++) { frame(); const v = G.Possess.body(); if (!W.walkableXY(v.x, v.y) && !G.Possess.onPlan(v)) bad++; } wall = { bad, x: r2(G.Possess.body().x - B.x) }; }
  ok('m12 o empurrão do gesto (drive) leva o corpo à frente, e numa parede para nela', lunge > 1.0 && lunge < 2.2 && (!wall || !wall.bad), JSON.stringify({ avanco: lunge, parede: wall }));
  ok('m12 moveScale deixa andar devagar; cancelAt recusa outra ação e a esquiva fora das janelas e aceita nelas', slow > 0.3 && slow < 1.6 && ref && noDodge && cut, JSON.stringify({ devagar: slow, recusou: ref, semEsquiva: noDodge, cortou: cut }));
}

// ================================ m13: o controle de jogo e o toque, pela conta ================================
if (want('m13')) {
  const In = G.Input3D; live(v0, A0[0], A0[1], YAW);
  const dz = In.dz(0.1, 0.1, In.PAD.dead, 1), half = In.dz(0, -0.6, In.PAD.dead, 1), full = In.dz(0, -1, In.PAD.dead, 1), look = In.dz(0.5, 0, In.PAD.lookDead, In.PAD.lookCurve);
  // (a controller of the proof's own: the left stick pushed up halfway, then all the way; A pressed, B pressed)
  const pad = { id: 'prova', connected: true, mapping: 'standard', axes: [0, -0.6, 0, 0], buttons: Array.from({ length: 17 }, () => ({ pressed: false, value: 0 })) };
  const got = []; const was = In.onAction; In.onAction = a => { got.push(a); if (a === 'esquivar') IN.dodge = true; };
  In.fakePad(pad); const sp = ax => { pad.axes[1] = ax; let m = 0; for (let k = 0; k < 100; k++) { In.poll(1 / 60); const a = In.axes(); IN.mx = a.mx; IN.mz = a.mz; IN.run = a.run; shuttle(); frame(); if (k > 60) m = Math.max(m, st().speed); } return r2(m); };
  const P = Av.paces(); const sHalf = sp(-0.6), sFull = sp(-1); pad.axes[1] = 0; for (let k = 0; k < 30; k++) { In.poll(1 / 60); const a = In.axes(); IN.mx = a.mx; IN.mz = a.mz; frame(); }
  pad.buttons[0] = { pressed: true, value: 1 }; In.poll(1 / 60); const jumped = IN.jump === true || st().loco === 'air'; frame(); pad.buttons[0] = { pressed: false, value: 0 }; In.poll(1 / 60); for (let k = 0; k < 60; k++) frame();
  pad.buttons[1] = { pressed: true, value: 1 }; In.poll(1 / 60); frame(); const dodged = !!st().dodge; pad.buttons[1] = { pressed: false, value: 0 }; In.poll(1 / 60); for (let k = 0; k < 60; k++) frame();
  // (the trigger: pressed past half, let go under a third — no flicker in between)
  const trig = []; for (const v of [0.2, 0.45, 0.55, 0.4, 0.36, 0.3, 0.2, 0.6, 0.31]) { pad.buttons[7] = { pressed: v > 0.1, value: v }; In.poll(1 / 60); trig.push(In.down.atacar ? 1 : 0); }
  const flick = trig.join('') === '001110010' ? 0 : 1;
  In.fakePad(null); In.poll(1 / 60); In.onAction = was; stop();
  // (the fingers' stick: a ring of 56 px — a thumb a little out walks, at the ring trots, past it by a third sprints)
  const ts = l => { const s = In.touchStick(0, -l); return { m: r2(s.m), run: s.run }; };
  const t10 = ts(5), t30 = ts(25), t56 = ts(56), t80 = ts(80);
  ok('m13 o controle: a zona morta, o bastão analógico (a meio anda, todo trota), A pula, B esquiva, o gatilho sem piscar', !dz[2] && half[2] > 0.4 && half[2] < 0.6 && full[2] === 1 && look[2] < 0.2 && sHalf < P.walk * 1.2 && sFull > P.jog * 0.9 && jumped && dodged && !flick && got.includes('esquivar'),
    JSON.stringify({ zonaMorta: dz[2], meio: r2(half[2]), todo: full[2], olharCurva: r2(look[2]), vel: { meio: sHalf, todo: sFull, andar: r2(P.walk), trote: r2(P.jog) }, pulou: jumped, esquivou: dodged, gatilho: trig.join(''), acoes: got }));
  ok('m13 o bastão do toque: zona morta no meio, o comprimento do empurrão é a velocidade, além do anel a disparada', t10.m === 0 && t30.m > 0.2 && t30.m < 0.5 && t56.m === 1 && !t56.run && t80.run, JSON.stringify({ '5px': t10, '25px': t30, '56px': t56, '80px': t80 }));
}

// ================================ m14: o verificador ================================
{ const q = vbad(); const e = M.erros();
  ok('m14 o verificador limpo, sem erro de módulo nem aviso no console', !q.length && !Object.keys(e.mod).length && !e.console.length, `${q.slice(0, 3).map(x => `S${x.sev} ${x.sys}: ${x.msg}`).join(' · ') || 'verificador limpo'}; módulos ${JSON.stringify(e.mod)}; console ${e.console.slice(0, 2).join(' | ')}`); }
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'PASSOU (movimento)');
process.exit(fails.length ? 1 : 0);
