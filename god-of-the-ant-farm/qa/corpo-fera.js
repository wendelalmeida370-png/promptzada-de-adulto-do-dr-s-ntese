// corpo-fera: o corpo encarnado diante das feras (L-698; D-330 a D-334), em Node, com o corpo de verdade (space, possess,
// interact, avatar e as poses do people3d, como o qa/visual/corpo-mundo.js) — no mundo pronto «cidade» (ou o dado):
//   node qa/corpo-fera.js [mundo]          (uma parte só: ONLY=f5,f6 node qa/corpo-fera.js)
//   node qa/corpo-fera.js tela [PASTA]     no navegador, com o 3D de verdade: o leão e o hipopótamo atacando o corpo, as fotos
//                                          do Modo Encarnado na PASTA (≈ 5 min; o WebGL por software)
// O que a crônica conta (L-698):
// f1 um adulto tomado pelo deus e morto por um rinoceronte: uma linha só da morte na crônica, a do mundo, com a fera e o fim do
//    deus — e o rinoceronte mata, não devora (D-334);
// f2 o mesmo com uma fera que ninguém viu (sem lastBeast: «uma fera»): uma linha só, com o fim do deus;
// O corpo das feras (D-330, D-331):
// f3 as medidas do G.Corpo.DIM são as das malhas do jogo (js/faunamesh.js, medidas de novo aqui: a malha que mudou é dita), e o
//    metro da casa do G.Corpo é o do 3D (G.Space.TILE);
// f4 quem fica no caminho: o hipopótamo, o leão, a vaca, o cão, o crocodilo, o avestruz sim; a galinha, o gato, a lebre, a rã, a
//    víbora, a jiboia, a águia no chão não; das carcaças, só as grandes (o hipopótamo, o elefante, a vaca), não a do cervo;
// f5 o corpo anda reto contra um hipopótamo parado, de dezesseis lados: nunca entra nele, para encostado de frente e escorrega pelo
//    lado de quem vem de viés; e um hipopótamo no rio, com o corpo na água;
// f6 o hipopótamo que investe contra o corpo para encostado (nunca dentro), dá a mordida com o gesto dela posto no corpo, e o
//    golpe chega na hora do gesto: o corpo é empurrado, derrubado (um gigante), a vida cai; e quanto tira uma mordida (medido);
// f7 o leão faminto caça o corpo: espreita, salta (o gesto de cada um no corpo), derruba, morde — e a morte: o fim do deus na
//    crônica, o registro do fim com o leão e o último golpe, «Morto por um leão»;
// Os casos ruins (D-332, D-333):
// f8 salvar e carregar no meio de um ataque: os golpes no ar não vão no save (nada preso), o corpo volta, derrubado se o mundo o
//    derrubou, e o mundo segue limpo;
// f9 o corpo que recua a tempo: o golpe dado erra (a esquiva), e não tira vida;
// f10 o corpo morre no meio do golpe por outra causa, a fera morre no meio, o deus pega a fera na mão: o golpe some, sem erro;
// f11 o verificador acusa o corpo dentro de um bicho (posto lá pela mão da prova) — e o passo do mundo o põe para fora;
// As pessoas (D-330):
// f12 o corpo anda reto contra alguém parado: não o atravessa (entra no máximo um palmo), passa por ele de lado; e com ninguém
//     vivido, a regra de alcance do mundo é a de sempre;
// e o verificador limpo (S0–S2), sem erro de módulo nem do console.
const path = require('path'), fs = require('fs');
if (process.argv[2] === 'tela') { tela(process.argv[3] || path.join(require('os').tmpdir(), 'corpo-fera')); return; }
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
// (f3, before the world: the meshes measured by the game's own rig in a process of their own — gestos-lib has its own G)
let meshDims = null;
if (want('f3')) {
  const code = `const L = require(${JSON.stringify(path.join(__dirname, 'visual', 'gestos-lib.js'))}); const { D, B, meshOf, forms } = L;
    const TAIL = new Set(['tail0', 'tail1', 'tail2', 'tail3'].map(n => B[n])); const out = {};
    const q = (arr, p) => { const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]; };
    for (const kind of Object.keys(D.species)) { const e = D.species[kind]; const form = forms[e.mesh]; if (!form) continue; const mesh = meshOf(e.mesh); const sc = e.scale || 1; const pts = [];
      for (let i = 0; i < mesh.n; i++) { let wt = 0; for (let k = 0; k < 4; k++) if (TAIL.has(mesh.bi[i * 4 + k])) wt += mesh.bw[i * 4 + k] / 255; if (wt > 0.5) continue; pts.push([mesh.pos[i * 3] * sc, mesh.pos[i * 3 + 1] * sc, mesh.pos[i * 3 + 2] * sc]); }
      const low = pts.filter(p => p[1] < 1.9);
      out[kind] = [q(pts.map(p => p[2]), 0.005), q(pts.map(p => p[2]), 0.995), q((low.length ? low : pts).map(p => Math.abs(p[0])), 0.97), q(pts.map(p => p[1]), 0.995)]; }
    process.stdout.write(JSON.stringify(out));`;
  try { meshDims = JSON.parse(require('child_process').execFileSync(process.execPath, ['-e', code], { cwd: path.join(__dirname, '..'), maxBuffer: 1 << 24 }).toString()); } catch (e) { meshDims = { err: String(e.message).slice(0, 200) }; }
}
const M = require('./nodemundo.js');
const G = M.load({ qa: true, extra: ['js/space.js', 'js/people3d.js', 'js/possess.js', 'js/interact.js', 'js/avatar.js', 'qa/corpo-fera-inv.js'] });
M.pronto(process.argv[2] || 'cidade');
let S = G.S; const W = G.W, Co = G.Corpo, TL = G.Space.TILE; const fails = [];
const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | corpo-fera ${name} | ${info}`); if (!c) fails.push(name); };
const god = f => { G.inSim++; try { return f(); } finally { G.inSim--; } };
const bad = () => QA.check().filter(q => q.sev <= 2).map(q => `[S${q.sev}] ${q.sys}: ${q.msg}`);
const base = new Set(bad());
const RDT = 1 / 30; const IN = G.Avatar.input;
const frame = (world) => { if (world !== false) G.debug.step(RDT * G.Space.TIME); G.Avatar.frame(RDT); };
const r1 = x => Math.round(x * 10) / 10, r2 = x => Math.round(x * 100) / 100;
// (a grown-up out of doors the god can take, by id — never by name)
const pick = (not) => [...S.villagers.values()].filter(o => o.age >= 18 && o.age < 55 && !o.inside && !not.includes(o.id) && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];

// ------------------------------ what the chronicle tells (L-698) ------------------------------
if (want('f1') || want('f2')) {
  // (the body taken and killed by a beast; the lines of its death in the chronicle since)
  const dies = (v, beast) => {
    const h0 = S.history.length; const took = G.Possess.take(v);
    if (!took || took.ok === false) return { took: false, why: took && took.why };
    v.lastBeast = beast; god(() => G.Village.kill(v, 'beast'));
    const lines = S.history.slice(h0).filter(e => e.txt.includes(v.name) && /devorad|mort[oa] por|picada/.test(e.txt)).map(e => e.txt);
    return { took: true, avatar: !!S.avatar, dead: !S.villagers.has(v.id), lines };
  };
  const end = /— com o deus vivendo em seu corpo\.$/; const used = [];
  if (want('f1')) { const v = pick(used); if (v) used.push(v.id); const r = v ? dies(v, 'rhino') : null;
    ok('f1 morto por um rinoceronte com o deus no corpo: uma linha só, a do mundo, com a fera e o fim do deus (o rinoceronte mata, não devora)', !!r && r.took && r.dead && !r.avatar && r.lines.length === 1 && /mort[oa] por um rinoceronte/.test(r.lines[0]) && end.test(r.lines[0]),
      !v ? 'ninguém para tomar' : !r.took ? `não tomou ${v.name}: ${r.why}` : `${v.name} #${v.id}: ${r.lines.length} linha(s) — ${r.lines.map(t => `«${t}»`).join(' · ') || 'nenhuma'}`); }
  if (want('f2')) { const v = pick(used); if (v) used.push(v.id); const r = v ? dies(v, undefined) : null;
    ok('f2 morto por uma fera sem nome com o deus no corpo: uma linha só, com o fim do deus', !!r && r.took && r.dead && !r.avatar && r.lines.length === 1 && /uma fera/.test(r.lines[0]) && end.test(r.lines[0]),
      !v ? 'ninguém para tomar' : !r.took ? `não tomou ${v.name}: ${r.why}` : `${v.name} #${v.id}: ${r.lines.length} linha(s) — ${r.lines.map(t => `«${t}»`).join(' · ') || 'nenhuma'}`); }
}

// ------------------------------ the stage ------------------------------
// an open flat field far from the towns (no house, tree, rock, water or wall within six tiles; ten tiles from any town), the wild
// beasts that people fear cleared from thirty tiles round it (T-1330), the body lived there; and a beast put by the test's hand
function field(water) {
  const N = G.N; const far = (x, y) => [...S.settlements.values()].every(s => G.dist(s.cx, s.cy, x, y) > 14);
  const clear = (x, y, r, sl) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; if (!W.inb(xx, yy)) return false; const i = W.idx(xx, yy);
    if (!W.walkable(i) || S.occ[i] || S.treeAt[i] || S.objAt[i] || S.wall[i] || S.road[i] || S.type[i] <= G.T.RIVER || S.slope[i] > sl) return false; } return true; };
  // (the flattest and widest there is: four tiles round at a slope of 0,8 — then less wide, then steeper)
  for (const [r, sl] of water ? [[0, 0]] : [[4, 0.8], [3, 1.1], [2, 1.1]]) for (let y = 12; y < N - 12; y += 2) for (let x = 12; x < N - 12; x += 2) {
    if (!far(x, y)) continue;
    if (water) { const i = W.idx(x, y); if (S.type[i] !== G.T.RIVER || S.road[i]) continue; let n = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (S.type[W.idx(x + dx, y + dy)] === G.T.RIVER) n++; if (n >= 7) return [x + 0.5, y + 0.5]; continue; }
    if (clear(x, y, r, sl)) return [x + 0.5, y + 0.5];
  }
  return null;
}
function clearBeasts(x, y, r) { for (const a of [...S.animals.values()]) if (G.dist(a.x, a.y, x, y) < r && !G.Animals.DEF[a.kind].dom && !G.Animals.DEF[a.kind].town) G.Animals.remove(a); }
function live(v, x, y, yaw) {
  if (G.Possess.body()) G.Possess.release('deus'); G.Avatar.detach(); clearBeasts(x, y, 30);
  G.Vg.endTask(v); v.inside = 0; v.x = x; v.y = y; v.path = null; v.hp = 100; v.sleeping = false; v.downT = 0; v.hunger = 10; v.energy = 90;
  const r = G.Possess.take(v); if (!r.ok) return false;
  G.Avatar.attach(v, yaw); IN.mx = IN.mz = 0; IN.run = IN.sneak = IN.jump = false; IN.camYaw = yaw; return true;
}
function beast(kind, x, y, fx, fy, extra) {
  const sp = G.Animals.DEF[kind]; const a = god(() => G.Animals.spawn(kind, x, y, Object.assign({ age: sp.life * 0.45, grown: 1, hunger: 0.1, t: 999, scan: 999, rest: 0 }, extra || {})));
  G.faceTo(a, fx, fy); G.debug.step(0.3); return a; // (a step of the world: the beasts' grid has it — a quarter of a second old, as ever)
}
const gapM = (a, v) => Co.gap(a, v.x, v.y, G.Avatar.TUNE.radius / TL) * TL; // (metres from the body's skin to the beast's)
const used = [];
const F = field(false); const v0 = F && pick(used);
if (!F || !v0) ok('palco', false, !F ? 'nenhum campo aberto longe das cidades' : 'ninguém para viver');
else {
  clearBeasts(F[0], F[1], 30); used.push(v0.id);
  console.log(`(o palco: o campo em ${F[0]},${F[1]}; o corpo: ${v0.name} #${v0.id})`);

  // ------------------------------ f3: the measures are the meshes' ------------------------------
  if (want('f3')) {
    const bad3 = []; let n = 0;
    if (meshDims && !meshDims.err) for (const k in Co.DIM) { const m = meshDims[k]; if (!m) { bad3.push(k + ' sem malha'); continue; } n++; const d = Co.DIM[k]; const off = Math.max(...d.map((x, i) => Math.abs(x - m[i]))); if (off > 0.06) bad3.push(`${k}: ${d.join('/')} × malha ${m.map(r2).join('/')}`); }
    const land = Object.keys(G.Animals.DEF).filter(k => G.Animals.DEF[k].cls !== 'water' && !Co.DIM[k]);
    ok('f3 as medidas dos bichos são as das malhas do jogo, e o metro da casa é o do 3D', meshDims && !meshDims.err && n > 60 && !bad3.length && !land.length && Co.TILE === G.Space.TILE,
      meshDims && meshDims.err ? meshDims.err : `${n} espécies; ${bad3.length ? 'diferentes: ' + bad3.slice(0, 5).join(' · ') : 'todas a menos de 6 cm'}${land.length ? '; sem medida: ' + land.join(', ') : ''}; casa ${Co.TILE} m × 3D ${G.Space.TILE} m`);
  }

  // ------------------------------ f4: who stands in the way ------------------------------
  if (want('f4')) {
    const at = (k, o) => { const a = beast(k, F[0] + 3, F[1] + 3, 1, 0, o); const r = Co.stands(a); G.Animals.remove(a); return r; };
    const yes = ['hippo', 'lion', 'vaca', 'cao', 'croc', 'ostrich', 'elephant', 'bear', 'wolf', 'cavalo'], no = ['galinha', 'gato', 'hare', 'rabbit', 'frog', 'viper', 'python', 'eagle', 'raven', 'lizard', 'fox'];
    const deadYes = ['hippo', 'elephant', 'vaca'], deadNo = ['deer', 'lion', 'wolf'];
    const wrong = [...yes.filter(k => !at(k)).map(k => k + ' não'), ...no.filter(k => at(k)).map(k => k + ' sim'), ...deadYes.filter(k => !at(k, { dead: true })).map(k => k + ' morto não'), ...deadNo.filter(k => at(k, { dead: true })).map(k => k + ' morto sim')];
    const young = at('hippo', { age: 0.05 }) === true; // (a calf of a hippo still stands in the way: 0,55 of the size)
    ok('f4 quem fica no caminho do corpo: os grandes sim, os pequenos e as cobras não, só as carcaças grandes', !wrong.length && young, wrong.length ? wrong.join(', ') : `sim: ${yes.join(', ')}; não: ${no.join(', ')}; carcaças: ${deadYes.join(', ')} sim, ${deadNo.join(', ')} não`);
  }

  // ------------------------------ f5: walking into a hippo ------------------------------
  if (want('f5')) {
    const H = beast('hippo', F[0], F[1], 1, 0.35); const hx = H.x, hy = H.y;
    const res = [];
    for (let k = 0; k < 16; k++) {
      const th = k / 16 * Math.PI * 2; const R = 6.5 / TL; const x = hx + Math.cos(th) * R, y = hy + Math.sin(th) * R;
      if (!live(v0, x, y, th + Math.PI)) { res.push({ k, err: 'não tomou' }); continue; }
      IN.camYaw = Math.atan2(hy - y, hx - x); IN.mz = 1; IN.mx = 0; let worst = Infinity, touch = 0;
      for (let f = 0; f < 150; f++) { frame(false); const g = gapM(H, v0); worst = Math.min(worst, g); if (g < 0.05) touch++; }
      res.push({ k, worst: r2(worst), touch });
    }
    // (and at its flank: straight at it the body stops against it; at a slant — forty-five degrees — it slides along it and round
    // its end, as one slides along a wall)
    const flank = (slant) => { const a0 = Math.atan2(H.fy, H.fx), c = Math.cos(a0), s = Math.sin(a0); const back = slant ? 1.6 : 0, off = slant ? 3 : 6;
      const x = hx - s * off / TL - c * back / TL, y = hy + c * off / TL - s * back / TL;
      if (!live(v0, x, y, 0)) return null; IN.camYaw = slant ? Math.atan2(s - c, s + c) : Math.atan2(-c, s); IN.mz = 1; let worst = Infinity; const x0 = v0.x, y0 = v0.y;
      for (let f = 0; f < 240; f++) { frame(false); worst = Math.min(worst, gapM(H, v0)); }
      return { worst: r2(worst), along: r2(((v0.x - x0) * c + (v0.y - y0) * s) * TL), across: r2(((v0.x - x0) * -s + (v0.y - y0) * c) * TL), gap: r2(gapM(H, v0)) }; };
    const flat = flank(0), slide = flank(1);
    IN.mz = 0;
    const inside = res.filter(r => r.err || r.worst < -0.03), far = res.filter(r => !r.err && !r.touch);
    ok('f5 o corpo anda reto contra um hipopótamo de dezesseis lados: nunca entra nele, encosta e escorrega por ele', !inside.length && !far.length, `pior: ${r2(Math.min(...res.map(r => r.worst || 0)))} m; quadros encostado: ${res.map(r => r.touch).join(' · ')}${inside.length ? '; DENTRO: ' + JSON.stringify(inside) : ''}${far.length ? '; NUNCA CHEGOU: ' + JSON.stringify(far) : ''}`);
    ok('f5 contra o flanco o corpo para encostado; de viés escorrega por ele e passa da ponta', !!flat && !!slide && flat.worst > -0.03 && flat.gap < 0.05 && Math.abs(flat.along) < 0.3 && slide.worst > -0.03 && slide.along > 2.5, `reto: ${JSON.stringify(flat)}; de viés: ${JSON.stringify(slide)}`);
    G.Animals.remove(H);
    // in the river: a hippo in its water, the body coming at it through the water
    const R0 = field(true);
    if (!R0) ok('f5 no rio', false, 'nenhum rio largo longe das cidades');
    else {
      clearBeasts(R0[0], R0[1], 30); const Hr = beast('hippo', R0[0], R0[1], 0, 1); let got = null;
      for (let k = 0; k < 8 && !got; k++) { const th = k / 8 * Math.PI * 2; const x = R0[0] + Math.cos(th) * 5 / TL, y = R0[1] + Math.sin(th) * 5 / TL; if (!W.inb(x, y) || S.type[W.idx(x, y)] !== G.T.RIVER) continue;
        if (!live(v0, x, y, th + Math.PI)) continue; IN.camYaw = th + Math.PI; IN.mz = 1; let worst = Infinity; for (let f = 0; f < 200; f++) { frame(false); worst = Math.min(worst, gapM(Hr, v0)); }
        got = { k, worst: r2(worst), end: r2(gapM(Hr, v0)), loco: G.Avatar.state().loco, wade: r2(G.Avatar.wade()) }; }
      IN.mz = 0;
      ok('f5 no rio: o corpo na água não entra no hipopótamo (o que o dono viu)', !!got && got.worst > -0.03 && got.end < 0.2, got ? JSON.stringify(got) : 'nenhum lado de água para o corpo');
      G.Animals.remove(Hr);
    }
  }

  // ------------------------------ f6: the hippo charges the body ------------------------------
  // (a hippo angry at the body, twelve metres off: it comes at it, stops at its skin, bites with the gesture posed at it; the bite
  // lands at the gesture's contact: the body is pushed, thrown down — a giant —, the life drops)
  const charge = (v, dist, ang, kind) => {
    if (!live(v, F[0], F[1], 0)) return null;
    const x = v.x + Math.cos(ang) * dist / TL, y = v.y + Math.sin(ang) * dist / TL; const H = beast(kind || 'hippo', x, y, v.x - x, v.y - y);
    H.angry = 8; H.target = v.id; H.state = 'chase'; H.t = 6; H.scan = 0.4; god(() => G.Mente ? G.Mente.gesto(H, 'charge', 0, v.id) : G.Animals.gesture(H, 'charge', 0, v.id));
    return H;
  };
  if (want('f6')) {
    const H = charge(v0, 12, 0.4); const o = { worst: Infinity, minGap: Infinity, bite: 0, biteOn: 0, down: 0, push: 0, hits: [], frames: 0, gestures: new Set(), contactAt: null, hitAt: [] };
    const st0 = Co.stats(); const hp0 = v0.hp; let gT = null;
    for (let f = 0; f < 900 && S.villagers.has(v0.id) && G.S.avatar; f++) {
      frame(); o.frames++; const g = gapM(H, v0); o.worst = Math.min(o.worst, g); o.minGap = Math.min(o.minGap, g);
      if (H.gest) o.gestures.add(H.gest + (H.gestO === v0.id ? '→corpo' : ''));
      if (H.gest === 'bite' && H.gestO === v0.id) { o.bite++; if (gT === null) gT = S.clock; }
      const h = G.Avatar.hurtNow(); if (h && h.loco === 'down') o.down++; if (h && Math.hypot(h.kx, h.kz) > 0.5) o.push++;
      for (const e of G.Possess.hits()) if (!o.hits.some(q => q.n === e.n)) { o.hits.push(e); o.hitAt.push(r2(S.clock - (gT === null ? S.clock : gT))); }
      if (!(H.angry > 0) && o.hits.length) break;
    }
    const st = Co.stats(); const bites = o.hits.filter(e => e.kind === 'hippo'); const per = bites.length ? r1(bites.reduce((s, e) => s + e.amt, 0) / bites.length) : 0;
    ok('f6 o hipopótamo que investe para encostado no corpo, nunca dentro', o.worst > -0.06 && o.minGap < Co.REACH, `o mais perto: ${r2(o.minGap)} m da pele (pior ${r2(o.worst)}); ${o.frames} quadros`);
    ok('f6 a mordida tem o gesto dela, posto no corpo, e chega na hora do gesto', o.bite > 0 && st.blows > st0.blows && st.landed > st0.landed && bites.length > 0 && bites.every(e => e.from && e.big),
      `gestos: ${[...o.gestures].join(', ')}; golpes dados ${st.blows - st0.blows}, acertados ${st.landed - st0.landed}, errados ${st.missed - st0.missed}; chegaram ${o.hitAt.join(', ')} s depois do primeiro gesto`);
    ok('f6 o corpo reage: empurrado, derrubado pelo gigante, a vida cai', o.push > 0 && o.down > 0 && v0.hp < hp0, `empurrado em ${o.push} quadros, no chão em ${o.down}; vida ${r1(hp0)} → ${r1(S.villagers.has(v0.id) ? v0.hp : 0)}; ${per} por mordida (a mordida do hipopótamo numa pessoa: (6 + 130 × 0,12) × 0,8 = 17,3, a cada 1,1 s do mundo)`);
    if (S.villagers.has(H.id)) G.Animals.remove(H);
  }

  // ------------------------------ f7: the hungry lion ------------------------------
  if (want('f7')) {
    const v = pick(used); if (v) used.push(v.id);
    if (!v || !live(v, F[0], F[1], 0)) ok('f7 o leão', false, 'ninguém para viver');
    else {
      const rec = G.S.avatar; const L = beast('lion', F[0] + 6, F[1] + 0.25, -1, 0, { hunger: 0.95 });
      L.target = v.id; L.onPerson = true; L.state = 'stalk'; L.t = 18; L.crouch = 0; L.carc = false;
      const seen = []; let down = 0, hits = 0, dead = false; const h0 = S.history.length;
      for (let f = 0; f < 3000 && !dead; f++) {
        frame(); const tag = (L.gest || '-') + (L.gestO === v.id ? '→corpo' : '');
        if (L.gest && L.gestO === v.id && !seen.includes(L.gest)) seen.push(L.gest);
        const h = G.Avatar.hurtNow(); if (h && h.loco === 'down') down++; hits = Math.max(hits, (G.S.avatar && G.S.avatar.hits ? G.S.avatar.hits.length : hits));
        dead = !S.villagers.has(v.id); void tag;
      }
      const end = rec.end; const lines = S.history.slice(h0).filter(e => e.txt.includes(v.name) && /devorad/.test(e.txt)).map(e => e.txt);
      ok('f7 o leão faminto caça o corpo: a espreita, o salto e o golpe, cada gesto posto no corpo', seen.includes('stalk') && seen.includes('pounce') && (seen.includes('bite') || seen.includes('swipe')), `gestos no corpo: ${seen.join(' → ')}`);
      ok('f7 o corpo é derrubado pelo salto e morre', down > 0 && dead && !G.S.avatar, `no chão ${down} quadros; ${dead ? 'morto' : 'vivo, vida ' + r1(v.hp)}`);
      ok('f7 a morte: uma linha na crônica com o leão e o fim do deus; o registro do fim tem o leão e o último golpe', lines.length === 1 && /leão/.test(lines[0]) && /com o deus vivendo em seu corpo/.test(lines[0]) && !!end && end.beast === 'lion' && !!end.hit && end.hit.kind === 'lion',
        `${lines.map(t => `«${t}»`).join(' · ') || 'nenhuma linha'}; fim: ${end ? JSON.stringify({ cause: end.cause, beast: end.beast, hit: end.hit && { amt: end.hit.amt, kind: end.hit.kind, big: end.hit.big } }) : 'nenhum'}`);
      if (S.animals.has(L.id)) G.Animals.remove(L);
    }
  }

  // ------------------------------ f8: a save in the middle of an attack ------------------------------
  if (want('f8')) {
    const v = pick(used); if (v) used.push(v.id);
    let r = null;
    if (v && live(v, F[0], F[1], 0)) {
      const L = beast('lion', F[0] + 4, F[1], -1, 0, { hunger: 0.95 }); L.target = v.id; L.onPerson = true; L.state = 'stalk'; L.t = 18;
      let pend = 0, downed = false;
      for (let f = 0; f < 1500; f++) { frame(); if (!S.villagers.has(v.id)) break; if (Co.pending().length) pend++; if (v.downT > S.clock + 0.3 && Co.pending().length) { downed = true; break; } }
      const p0 = Co.pending().length, hp = v.hp, id = v.id;
      M.salvarCarregar(); S = G.S; const w = S.villagers.get(id); let att = false;
      if (w && G.Possess.body() === w) { G.Avatar.attach(w, 0); att = true; }
      const after = { avatar: !!G.S.avatar, pend: Co.pending().length, hits: G.S.avatar ? G.S.avatar.hits.length : -1, loco: att ? G.Avatar.hurtNow().loco : '-', down: w ? r2(w.downT - S.clock) : 0 };
      for (let f = 0; f < 240; f++) { frame(); if (!S.villagers.has(id) || !G.S.avatar) break; }
      const e = M.erros(); r = { downed, p0, hp: r1(hp), after, err: Object.keys(e.mod).length + e.console.length, qa: bad().filter(q => !base.has(q)) };
    }
    ok('f8 salvar e carregar no meio do ataque: nada preso, o corpo volta (no chão, se o mundo o derrubou), o mundo segue limpo', !!r && r.downed && r.p0 > 0 && r.after.avatar && r.after.pend === 0 && r.after.hits === 0 && (r.after.down <= 0 || r.after.loco === 'down') && !r.err && !r.qa.length,
      r ? JSON.stringify(Object.assign({}, r, { qa: r.qa.slice(0, 3) })) : 'ninguém para viver');
  }

  // ------------------------------ f9: the step back in time ------------------------------
  if (want('f9')) {
    const v = pick(used); if (v) used.push(v.id); let r = null;
    if (v && live(v, F[0], F[1], 0)) {
      const H = charge(v, 7, 2.2, 'rhino'); const st0 = Co.stats(); let hp = null, n0 = 0; // (a rhino: a hippo far from its water does not walk there)
      for (let f = 0; f < 900; f++) { frame(); if (Co.pending().length) { hp = v.hp; n0 = G.Possess.hits().length; break; } }
      if (hp !== null) {
        // (the body two metres and a half back from the beast, at once — as a quick step: the world moves it, the controller follows)
        const f0 = Co.foot(H); const q = Co.near(f0, v.x, v.y); const dx = v.x - q[0], dy = v.y - q[1], l = Math.hypot(dx, dy) || 1; v.x += dx / l * 2.5 / TL; v.y += dy / l * 2.5 / TL;
        for (let f = 0; f < 40 && Co.pending().length; f++) frame();
        const st = Co.stats(); r = { missed: st.missed - st0.missed, hp0: r1(hp), hp: r1(v.hp), hits: G.Possess.hits().length - n0 };
      }
      if (S.animals.has(H.id)) G.Animals.remove(H);
    }
    ok('f9 o corpo que recua a tempo: o golpe dado erra e não tira vida', !!r && r.missed >= 1 && r.hits === 0 && r.hp === r.hp0, r ? JSON.stringify(r) : 'nenhum golpe dado');
  }

  // ------------------------------ f10: the bad cases mid-blow ------------------------------
  if (want('f10')) {
    const out = {};
    for (const how of ['corpo', 'fera', 'mao']) {
      const v = pick(used); if (v) used.push(v.id); if (!v || !live(v, F[0], F[1], 0)) { out[how] = 'ninguém'; continue; }
      const H = charge(v, 7, 1.1 + used.length, 'rhino'); let got = false; for (let f = 0; f < 900; f++) { frame(); if (Co.pending().length) { got = true; break; } }
      if (!got) { out[how] = 'nenhum golpe'; continue; }
      const st0 = Co.stats(), n0 = G.Possess.hits().length;
      if (how === 'corpo') god(() => G.Village.kill(v, 'queda', true));
      else if (how === 'fera') god(() => G.Animals.kill(H, null, 'god'));
      else H.held = true;
      for (let f = 0; f < 40; f++) frame();
      const st = Co.stats(); out[how] = { dropped: st.dropped - st0.dropped, landed: st.landed - st0.landed, hits: G.S.avatar ? G.Possess.hits().length - n0 : 0, pend: Co.pending().length, avatar: !!G.S.avatar };
      if (how === 'mao') H.held = false; if (S.animals.has(H.id)) G.Animals.remove(H);
    }
    const e = M.erros();
    ok('f10 o corpo morre, a fera morre, o deus pega a fera no meio do golpe: o golpe some, sem erro', ['corpo', 'fera', 'mao'].every(k => out[k] && out[k].dropped >= 1 && out[k].landed === 0 && out[k].pend === 0) && !out.corpo.avatar && !Object.keys(e.mod).length,
      JSON.stringify(out));
  }

  // ------------------------------ f11: the verifier ------------------------------
  if (want('f11')) {
    const v = pick(used); if (v) used.push(v.id); let r = null;
    if (v && live(v, F[0], F[1], 0)) {
      G.debug.step(0.3); const H = god(() => G.Animals.spawn('hippo', v.x + 0.4 / TL, v.y, { age: 12, grown: 1, t: 999, scan: 999 })); G.faceTo(H, 1, 0); // (put on the body by the test's hand: the body 0,4 m from its middle)
      G.debug.step(0.3); v.x = H.x - 0.4 / TL; v.y = H.y; G.Avatar.frame(0); // (the beasts' grid has it; and the body back in it — the test's hand again)
      const said = QA.check().filter(q => q.sys === 'corpo-fera' && q.sev === 2).map(q => q.msg);
      G.debug.step(0.05); // (one step of the world: the beast is put back at the body's skin)
      const after = QA.check().filter(q => q.sys === 'corpo-fera').map(q => q.msg);
      r = { said: said.length, after: after.length, gap: r2(gapM(H, v)), msg: said[0] || '' };
      G.Animals.remove(H);
    }
    ok('f11 o verificador acusa o corpo dentro de um bicho, e o passo do mundo o põe para fora', !!r && r.said >= 1 && r.after === 0 && r.gap > -0.05, r ? JSON.stringify(r) : 'ninguém para viver');
  }

  // ------------------------------ f12: the people ------------------------------
  if (want('f12')) {
    const v = pick(used); if (v) used.push(v.id); const o = pick(used.concat(v ? [v.id] : [])); let r = null;
    if (v && o && live(v, F[0], F[1], 0)) {
      G.Vg.endTask(o); o.inside = 0; o.x = F[0] + 4 / TL; o.y = F[1] + 0.06 / TL; o.path = null; o.sleeping = false; o.downT = S.clock + 30; // (held still: the world keeps them where they are)
      G.debug.step(0.3); // (the people's grid knows where they stand)
      IN.camYaw = 0; IN.mz = 1; let worst = Infinity; const ox = o.x, oy = o.y;
      for (let f = 0; f < 180; f++) { G.Avatar.frame(RDT); worst = Math.min(worst, (G.dist(v.x, v.y, ox, oy) * TL) - (0.27 + G.Avatar.TUNE.radius)); }
      IN.mz = 0; r = { worst: r2(worst), past: r2((v.x - ox) * TL) };
    }
    const npc = [...S.villagers.values()].find(p => !G.S.avatar || p.id !== G.S.avatar.id); const hip = beast('hippo', F[0] + 9, F[1] + 9, 1, 0);
    const same = npc ? [0.3, 0.9, 1.05, 2].every(d => { npc.x = hip.x + d; npc.y = hip.y; return Co.reach(hip, npc, 1.05) === (G.dist(hip.x, hip.y, npc.x, npc.y) < 1.05); }) : false;
    G.Animals.remove(hip);
    ok('f12 o corpo não atravessa quem está parado (um palmo no máximo) e passa por ele de lado; para os outros, o alcance de sempre', !!r && r.worst > -0.22 && r.past > 0.8 && same, r ? JSON.stringify(r) + `; alcance de quem não é o corpo igual ao do mundo: ${same}` : 'ninguém para viver');
  }
}
M.viver(0.1); const b = bad().filter(q => !base.has(q)), e = M.erros();
ok('verificador', b.length === 0 && !Object.keys(e.mod).length && !e.console.length, `${b.length ? b.slice(0, 4).join(' | ') : 'limpo (S0–S2)'}; erro de módulo: ${Object.keys(e.mod).length ? JSON.stringify(e.mod) : 'nenhum'}; console: ${e.console.slice(0, 3).join(' | ') || 'nada'}`);
console.log(fails.length ? `FALHARAM: ${fails.join(', ')}` : 'tudo passou');
process.exitCode = fails.length ? 1 : 0;

// ------------------------------ tela: in the browser, the 3D seen ------------------------------
function tela(OUT) { require('./corpo-fera-tela.js')(OUT); }
