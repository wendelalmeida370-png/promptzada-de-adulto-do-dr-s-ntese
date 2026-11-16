// bichos-pose: the animals' poses tested without a browser (seconds, no WebGL): js/faunamesh.js and js/fauna-anim.js loaded in
// node, each skin bent on the CPU exactly as the shader of js/fauna3d.js bends it (each point by its four bones, from the
// bind joints), and the poses held to the ground.
//   node qa/visual/bichos-pose.js            → the proofs, for every beast on four legs (T-1295):
//     standing — the four feet on the ground, nothing under it; on uneven ground, each foot on the ground under it;
//     the stride — through the walk, the trot and the gallop (the hop of the rabbit and the hare), a foot that is down stays
//       where it was set (it slides back as fast as the body goes on: a stride a cycle), touches the ground and never sinks;
//     sitting (the dogs, the cats, the wolf, the foxes, the big cats, the hyena) — the four feet on the ground, the rump on
//       it, nothing under it, the head above the shoulders;
//     the young — the head bigger, the feet on the ground.
//   node qa/visual/bichos-pose.js dump KIND STATE PH OUT.json   → the bent near mesh (for a picture)
// (G.FaunaAnim's poses and the meshes are the game's own: nothing here is a copy of them)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
global.window = global; global.G = { worldHooks: [] }; window.G = G;
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
run('js/lib/three.min.js'); global.THREE = THREE;
run('js/faunamesh.js'); run('js/fauna-anim.js'); run('js/fauna3d.js'); // (its unpacker: the meshes are packed — format 3, D-266)
{ const u = fs.readFileSync(path.join(ROOT, 'js/util.js'), 'utf8'); vm.runInThisContext(u.match(/G\.hash = \(i\) => \{[\s\S]*?\n {2}\};/)[0]); } // (the gestures, D-280: the vocabulary, the layers, the recipes)
run('js/fauna-gestos.js'); run('js/fauna-gesto3d.js'); run('js/fauna-receitas.js');
const FA = G.FaunaAnim, D = G.FAUNAMESH, B = FA.B, NB = FA.BONES.length;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | bichos-pose ${name} | ${info}`); if (!c) fails.push(name); };
// (who grazes or pecks at the ground, as the 3D has it: the plant eaters, and the insect eaters of the towns and the farms)
const GRAZES = (() => { const src = fs.readFileSync(path.join(ROOT, 'js/animals.js'), 'utf8'); const out = {};
  for (const m of src.matchAll(/^\s{4}(\w+): \{ name: [^\n]*/gm)) { const l = m[0]; const d = (l.match(/diet: '(\w+)'/) || [])[1]; out[m[1]] = d === 'herb' || d === 'browse' || (d === 'insect' && /\b(town|dom): (true|1|'[^']*')/.test(l)); }
  return out; })();
const SITTERS = (() => { const s = fs.readFileSync(path.join(ROOT, 'js/people3d.js'), 'utf8').match(/const SITTERS = (\{[^}]*\})/); return s ? vm.runInThisContext('(' + s[1] + ')') : {}; })();

function decode(m) { const u = G.Fauna3D.unpack(m); return { n: u.n, pos: u.pos, bi: u.bi, bw: u.bw, zone: u.zone, idx: u.idx }; } // (the game's own unpacker)
// (the skin, as the shader bends it: each point by its bones' frames, moved back from the bind joints)
function bend(mesh, J, R) {
  const out = new Float32Array(mesh.n * 3); const e = R.map(r => r.elements);
  for (let i = 0; i < mesh.n; i++) {
    const x = mesh.pos[i * 3], y = mesh.pos[i * 3 + 1], z = mesh.pos[i * 3 + 2]; let X = 0, Y = 0, Z = 0;
    for (let k = 0; k < 4; k++) { const w = mesh.bw[i * 4 + k] / 255; if (!w) continue; const b = mesh.bi[i * 4 + k]; const m = e[b];
      const px = x - J[b * 3], py = y - J[b * 3 + 1], pz = z - J[b * 3 + 2];
      X += w * (m[0] * px + m[4] * py + m[8] * pz + m[12]); Y += w * (m[1] * px + m[5] * py + m[9] * pz + m[13]); Z += w * (m[2] * px + m[6] * py + m[10] * pz + m[14]); }
    out[i * 3] = X; out[i * 3 + 1] = Y; out[i * 3 + 2] = Z;
  }
  return out;
}
const I4 = new THREE.Matrix4();
const forms = {}; for (const k in D.forms) forms[k] = { J: new Float32Array(D.forms[k].bind), box: D.forms[k].box, meta: D.forms[k].meta };
const LEGS = ['flL', 'flR', 'hlL', 'hlR'];
// (which points of the mesh are a foot: weighted most to the leg's last bone, or its last but one, low down)
function feetOf(mesh, H) {
  const ft = LEGS.map(() => []);
  for (let i = 0; i < mesh.n; i++) { const b = mesh.bi[i * 4]; const L = FA.BONES[b]; if (!/^[fh]l[LR][23]$/.test(L) || mesh.pos[i * 3 + 1] > H * 0.1) continue; ft[LEGS.indexOf(L.slice(0, 3))].push(i); }
  return ft;
}
// (the sole: one point of the foot, the lowest of it as modelled — the point that is set down and must stay)
const soleOf = (mesh, ids) => { let best = ids[0]; for (const i of ids) if (mesh.pos[i * 3 + 1] < mesh.pos[best * 3 + 1] - 1e-4 || (Math.abs(mesh.pos[i * 3 + 1] - mesh.pos[best * 3 + 1]) <= 1e-4 && Math.abs(mesh.pos[i * 3]) > Math.abs(mesh.pos[best * 3]))) best = i; return best; };
const lowOf = (P, ids) => { let y = 1e9, z = 0; for (const i of ids) if (P[i * 3 + 1] < y) { y = P[i * 3 + 1]; z = P[i * 3 + 2]; } return [y, z]; };
const minY = P => { let y = 1e9; for (let i = 1; i < P.length; i += 3) y = Math.min(y, P[i]); return y; };
const lowestId = (P, ids) => { let y = 1e9, b = -1; for (const i of ids) if (P[i * 3 + 1] < y) { y = P[i * 3 + 1]; b = i; } return b; };
const minBone = (mesh, P) => { let y = 1e9, b = 0; for (let i = 0; i < mesh.n; i++) if (P[i * 3 + 1] < y) { y = P[i * 3 + 1]; b = mesh.bi[i * 4]; } return FA.BONES[b]; };
const st0 = o => Object.assign({ v: 0, ph: 0, t: 0, graze: 0, look: 0, id: 0, ears: 0, tail: 0, jaw: 0, sit: 0, young: 0 }, o);
const sp0 = { browse: false, swish: 1 };

if (process.argv[2] === 'dump') {
  const [kind, state, ph, out] = process.argv.slice(3); const mn = D.species[kind].mesh; const f = forms[mn]; const mesh = decode(D.meshes[mn]);
  const LL = (f.J[B.flL0 * 3 + 1] + f.J[B.hlL0 * 3 + 1]) * 0.5; const v = { stand: 0, walk: Math.sqrt(9.8 * LL) * 0.3, trot: Math.sqrt(9.8 * LL) * 0.9, gallop: Math.sqrt(9.8 * LL) * 1.8 }[state];
  const R = FA[f.meta.fam](THREE, I4, f, sp0, st0({ v: v || 0, ph: +ph, sit: state === 'sit' ? 1 : 0, young: state === 'young' ? 1 : 0 }));
  const P = bend(mesh, f.J, R); const idx = Array.from(decode(D.meshes[mn]).idx);
  fs.writeFileSync(out, JSON.stringify({ P: Array.from(P), idx, zone: Array.from(mesh.zone) })); console.log('wrote', out); return;
}

const report = { stand: [], hill: [], gait: [], sit: [], young: [], bird: [] };
// a bird afoot: through its walk, a foot that is down stays where it was set (a stride as long as its leg: FaunaAnim.birdStride)
function birdWalk(kind, e) {
  const f = forms[e.mesh]; const H = f.meta.H; const mesh = decode(D.meshes[e.mesh]); const ft = feetOf(mesh, H).slice(2);
  if (ft.some(a => !a.length)) { report.bird.push([kind, 9, 0]); return; }
  let fy = 1e9; for (const ids of ft) for (const i of ids) fy = Math.min(fy, mesh.pos[i * 3 + 1]); // (the feet's lowest point as modelled: the ground they stand on)
  const S = FA.birdStride(f), NS = 48, tol = fy + Math.max(0.002, H * 0.01); const Ps = [], tr = [[], []];
  for (let k = 0; k <= NS; k++) { const P = bend(mesh, f.J, FA.bird(THREE, I4, f, sp0, st0({ v: 0.4, ph: k / NS, t: 3 }))); Ps.push(P); ft.forEach((ids, l) => tr[l].push(lowestId(P, ids))); }
  let slip = 0, down = 0, tot = 0;
  tr.forEach(T => { for (let k = 0; k < NS; k++) { tot++; const i = T[k]; const y0 = Ps[k][i * 3 + 1], y1 = Ps[k + 1][i * 3 + 1]; if (y0 < tol) down++; if (y0 < tol && y1 < tol && T[k + 1] === i) slip = Math.max(slip, Math.abs((Ps[k + 1][i * 3 + 2] - Ps[k][i * 3 + 2]) * NS + S) / S); } });
  // (the peck at its deepest: the tip of the beak at the ground)
  const R = FA.bird(THREE, I4, f, sp0, st0({ graze: 1, t: Math.PI / 2 / 2.6 })), m = R[B.head].elements, nz = f.meta.nose, jh = B.head * 3;
  const by = m[1] * (nz[0] - f.J[jh]) + m[5] * (nz[1] - f.J[jh + 1]) + m[9] * (nz[2] - f.J[jh + 2]) + m[13];
  report.bird.push([kind, slip, down / tot, by, H]);
}
for (const kind in D.species) {
  const e = D.species[kind];
  if (e.fam === 'bird' && !forms[e.mesh].meta.upright) { birdWalk(kind, e); continue; }
  if (e.fam !== 'quad' || forms[e.mesh].meta.fam !== 'quad') continue;
  const f = forms[e.mesh]; const H = f.meta.H; const mesh = decode(D.meshes[e.mesh]); const ft = feetOf(mesh, H);
  if (ft.some(a => !a.length)) { ok(kind + ' pés', false, 'sem os pontos dos pés'); continue; }
  const LL = (f.J[B.flL0 * 3 + 1] + f.J[B.hlL0 * 3 + 1]) * 0.5; const tol = Math.max(0.003, H * 0.008);
  // standing
  { const P = bend(mesh, f.J, FA.quad(THREE, I4, f, sp0, st0({}))); const ys = ft.map(ids => lowOf(P, ids)[0]);
    report.stand.push([kind, Math.max(...ys.map(Math.abs)), minY(P)]);
    // (on uneven ground: the forefeet's ground higher than the frame's plane, the hind feet's lower — each foot on its own)
    const a = LL * 0.08, fy = [a, a * 0.5, -a, -a * 0.5]; const Q = bend(mesh, f.J, FA.quad(THREE, I4, f, sp0, st0({ fy })));
    report.hill.push([kind, Math.max(...ft.map((ids, l) => Math.abs(lowOf(Q, ids)[0] - fy[l] - ys[l])))]); }
  // the stride: every gait the beast has, a cycle in 48 steps
  const gaits = f.meta.hop ? [['hop', 1.2]] : f.meta.pillar ? [['walk', 0.3], ['trot', 1.4]] : [['walk', 0.3], ['trot', 0.9], ['gallop', 1.8]];
  for (const [gname, fr] of gaits) {
    const v = fr * Math.sqrt(9.8 * LL); const S = FA.strideOf(f.meta.hop ? 'hop' : FA.gaitOf(v, LL, f.meta.pillar), LL); const NS = 48;
    const tr = LEGS.map(() => []); let sink = 0, sinkB = ''; const Ps = [];
    for (let k = 0; k <= NS; k++) { const P = bend(mesh, f.J, FA.quad(THREE, I4, f, sp0, st0({ v, ph: k / NS, t: 3 }))); Ps.push(P); ft.forEach((ids, l) => tr[l].push(lowestId(P, ids))); const my = minY(P); if (my < sink) { sink = my; sinkB = minBone(mesh, P) + '@' + k; } }
    // (a foot is down while its lowest point is at the ground; that point — the same point from one step to the next: a
    // foot rolling onto its toe changes it — slides back a stride a cycle while the body goes on: the slip is how far from that)
    let slip = 0, down = 0, tot = 0;
    tr.forEach((T, l) => { const lv = Math.min(0, ...ft[l].map(i => mesh.pos[i * 3 + 1])) + tol; // (down: within tol of where the foot stands as modelled)
      for (let k = 0; k < NS; k++) { tot++; const i = T[k]; const y0 = Ps[k][i * 3 + 1], y1 = Ps[k + 1][i * 3 + 1]; if (y0 < lv && Ps[k + 1][T[k + 1] * 3 + 1] < lv) down++; if (y0 < lv && y1 < lv && T[k + 1] === i) { const dz = (Ps[k + 1][i * 3 + 2] - Ps[k][i * 3 + 2]) * NS; slip = Math.max(slip, Math.abs(dz + S) / S); } } });
    report.gait.push([kind + ' ' + gname, slip, down / tot, sink, sinkB]);
  }
  // sitting
  if (SITTERS[kind]) {
    const P = bend(mesh, f.J, FA.quad(THREE, I4, f, sp0, st0({ sit: 1 }))); const ys = ft.map(ids => lowOf(P, ids)[0]);
    // (the rump: the lowest point of the body behind the hips)
    let rump = 1e9; const hz = f.J[B.root * 3 + 2]; for (let i = 0; i < mesh.n; i++) { if (mesh.zone[i] !== 0) continue; const b = FA.BONES[mesh.bi[i * 4]]; if (/^[fh]l|tail/.test(b) || mesh.pos[i * 3 + 2] > hz) continue; rump = Math.min(rump, P[i * 3 + 1]); }
    const R = FA.R(); const head = R[B.head].elements[13], sh = R[B.flL0].elements[13];
    report.sit.push([kind, Math.max(...ys.map(Math.abs)), rump, minY(P), head - sh, H, minBone(mesh, P)]);
  }
  // the young
  { const P = bend(mesh, f.J, FA.quad(THREE, I4, f, sp0, st0({ young: 1 }))); const ys = ft.map(ids => lowOf(P, ids)[0]); report.young.push([kind, Math.max(...ys.map(Math.abs)), minY(P), H]); }
}
const f3 = x => x.toFixed(3);
// (standing: the feet at the ground within 1% of the height — the decimator's own play)
{ const H = k => forms[D.species[k].mesh].meta.H; const bad = report.stand.filter(r => r[1] > Math.max(0.012, H(r[0]) * 0.012) || r[2] < -Math.max(0.01, H(r[0]) * 0.012)); ok('de pé', !bad.length, `${report.stand.length} espécies; os pés no chão (pior ${f3(Math.max(...report.stand.map(r => r[1])))} m)` + (bad.length ? '; fora: ' + bad.map(r => `${r[0]} ${f3(r[1])}/${f3(r[2])}`).join(', ') : '')); }
{ const bad = report.hill.filter(r => r[1] > 0.012); ok('no chão desigual', !bad.length, `${report.hill.length} espécies; cada pé no seu chão (pior a ${f3(Math.max(...report.hill.map(r => r[1])))} m)` + (bad.length ? '; fora: ' + bad.map(r => `${r[0]} ${f3(r[1])}`).join(', ') : '')); }
{ const bad = report.gait.filter(r => r[1] > 0.25 || r[2] < 0.2 || r[3] < -0.03); const w = report.gait.slice().sort((a, b) => b[1] - a[1]).slice(0, 4);
  ok('o passo', !bad.length, `${report.gait.length} passos; o pé no chão escorrega no pior ${(w[0][1] * 100).toFixed(0)}% (${w.map(r => r[0] + ' ' + (r[1] * 100).toFixed(0) + '%').join(', ')}); no chão ${(Math.min(...report.gait.map(r => r[2])) * 100).toFixed(0)}% a ${(Math.max(...report.gait.map(r => r[2])) * 100).toFixed(0)}% do ciclo` + (bad.length ? '; fora: ' + bad.map(r => `${r[0]} (escorrega ${(r[1] * 100).toFixed(0)}%, no chão ${(r[2] * 100).toFixed(0)}%, afunda ${f3(r[3])} ${r[4]})`).join(', ') : '')); }
{ const bad = report.sit.filter(r => r[1] > Math.max(0.015, r[5] * 0.06) || r[2] > r[5] * 0.12 || r[3] < -Math.max(0.015, r[5] * 0.05) || r[4] < 0);
  ok('sentado', report.sit.length > 0 && !bad.length, `${report.sit.length} espécies: ` + report.sit.map(r => `${r[0]} pés ${f3(r[1])} anca ${f3(r[2])} fundo ${f3(r[3])} (${r[6]})`).join(', ')); }
{ const bad = report.young.filter(r => r[1] > Math.max(0.015, r[3] * 0.0125) || r[2] < -Math.max(0.015, r[3] * 0.0125)); // (the legs longer by a quarter: the decimator's play with them)
  ok('filhote', !bad.length, `${report.young.length} espécies; os pés no chão (pior ${f3(Math.max(...report.young.map(r => r[1])))} m)` + (bad.length ? '; fora: ' + bad.map(r => `${r[0]} ${f3(r[1])}/${f3(r[2])}`).join(', ') : '')); }
{ const pk = report.bird.filter(r => GRAZES[r[0]]); const bad = pk.filter(r => Math.abs(r[3]) > Math.max(0.02, r[4] * 0.08)); ok('a bicada', pk.length > 0 && !bad.length, `${pk.length} aves que bicam o chão (${pk.map(r => r[0]).join(', ')}); a ponta do bico no chão no fundo da bicada (pior a ${f3(Math.max(...pk.map(r => Math.abs(r[3]))))} m)` + (bad.length ? '; fora: ' + bad.map(r => `${r[0]} ${f3(r[3])}`).join(', ') : '')); }
{ const bad = report.bird.filter(r => r[1] > 0.25 || r[2] < 0.25); ok('o passo das aves', report.bird.length > 0 && !bad.length, `${report.bird.length} aves a pé; escorrega no pior ${(Math.max(...report.bird.map(r => r[1])) * 100).toFixed(0)}%` + (bad.length ? '; fora: ' + bad.map(r => `${r[0]} (escorrega ${(r[1] * 100).toFixed(0)}%, no chão ${(r[2] * 100).toFixed(0)}%)`).join(', ') : '')); }
// the gestures against the ground (D-280; the whole of them in bichos-gestos.js): every gesture of the four-legged at its middle —
// numbers in every matrix, nothing under the ground beyond the kind's own standing pose and 3.5% of its height (the poses that go
// under on purpose excepted), the lying ones on it; the dead on their side, settled on it
{ const FG = FA.Gest, Ge = G.Gestos, UNDER = { burrow: 1, dive: 1, swim: 1, hide: 1 }; const bad = [], badD = []; let n = 0;
  for (const kind in D.species) { const e = D.species[kind]; if (e.fam !== 'quad' || forms[e.mesh].meta.fam !== 'quad') continue;
    const f = forms[e.mesh]; const H = f.meta.H, tol = Math.max(0.012, H * 0.035); const mesh = decode(D.meshes[e.mesh]); if (!f.hull) f.hull = G.Fauna3D.hullOf(e.mesh, n => G.Fauna3D.unpack(D.meshes[n])); // (the game's: the ground from the near level, the contacts from the middle — L-1047)
    const base = Math.min(0, minY(bend(mesh, f.J, FA.quad(THREE, I4, f, sp0, st0({ kind, gx: { gn: null, gk: 0, pn: null, pk: 0 } })))));
    for (const g of Ge.of(kind)) { if (UNDER[g]) continue; const d = Ge.DEF[g].d; n++;
      const R = FA.quad(THREE, I4, f, sp0, st0({ kind, id: 3, t: 4, dt: 1 / 30, gx: { gn: g, gt: d > 0 ? d * 0.45 : 1.3, gk: 1, gd: d, gv: 0, pn: null, pk: 0 } }));
      if (!R.every(m => m.elements.every(Number.isFinite))) { bad.push(kind + '/' + g + ' NaN'); continue; }
      if (FG.P[FG.I.LIFT] < -0.05) continue; const lo = minY(bend(mesh, f.J, R)); if (lo < base - tol) bad.push(`${kind}/${g} ${lo.toFixed(3)}`); }
    const Rd = FA.quad(THREE, I4, f, sp0, st0({ kind, id: 3, t: 4, dead: 1, gx: { gn: null, gk: 0, pn: null, pk: 0 } })); const ld = minY(bend(mesh, f.J, Rd)); if (Math.abs(ld) > tol) badD.push(`${kind} ${ld.toFixed(3)}`); }
  ok('os gestos no chão', !bad.length, `${n} gestos dos de quatro patas no meio deles; nada debaixo do chão além da pose de pé e de 3,5% da altura` + (bad.length ? '; fora: ' + bad.slice(0, 12).join(', ') : ''));
  ok('os mortos no chão', !badD.length, 'os de quatro patas mortos, de lado, assentados no chão' + (badD.length ? '; fora: ' + badD.join(', ') : '')); }
if (fails.length) { console.log(`FALHOU: ${fails.length}`); process.exit(1); }
console.log('PASSOU');
