// bichos-gestos: the gestures of G.Gestos on the beasts' bodies (D-280 a D-284) — every kind, every gesture it can make.
//   node qa/visual/bichos-gestos.js                 → the proofs, in node (seconds; the game's poses and meshes, bent on the CPU):
//     a pose for every (kind, gesture) of the families — no gesture of p1 or p2 falls back to standing (the coverage, with the
//       p3 % reported); each pose at three moments: numbers, the bones' lengths kept, the body different from standing, nothing
//       under the ground beyond the tolerance (the poses that go under on purpose — the burrow, the dive, the swim — excepted),
//       on the ground the poses that lie (the body settled within it);
//     the dead of each family: lying, settled on the ground, the eyes shut;
//     two bodies: a lion's jaws at a zebra's throat, a tiger's at a deer's nape, a wolf's on a moose, a crocodile's at a gnu's
//       throat in the death roll, a python's coils round a capybara (and its head at the capybara's), an eagle's talons on a
//       rabbit's back, two deer's brows met in the clash, a zebra's kick at full stretch — each within a tolerance of its point.
//   node qa/visual/bichos-gestos.js folha PASTA [família|espécies] [gestos]  → the quick contact sheets (CPU), one a family
//   node qa/visual/bichos-gestos.js jogo PASTA [PASTA_DO_JOGO]                 → the sheets by the game's own renderer (a browser:
//     the beasts set in the gesture with G.Animals.gesture, on open ground of the world «cidade», the two-body scenes too; the
//     mouth of each holder measured against its point; the verifier and the module errors)
const L = require('./gestos-lib.js');
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { FA, FG, D, B, Ge, forms, THREE } = L;
const mode = process.argv[2] || 'prova';
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | bichos-gestos ${name} | ${info}`); if (!c) fails.push(name); };
const kinds = Object.keys(D.species).filter(k => G.Animals.DEF[k] && G.Animals.DEF[k].cls !== 'water');
const famOf = k => forms[D.species[k].mesh].meta.fam;
const REC = FG.REC;
// (the poses that go under the ground or the water on purpose, or are in the air)
const UNDER = { burrow: 1, dive: 1, swim: 1, hide: 1, deathroll: 1, coil: 1, stoop: 1 };
const FLYMESH = { stoop: 1 };

if (mode === 'prova') {
  // ---------------- the coverage ----------------
  const cov = { 1: [0, 0], 2: [0, 0], 3: [0, 0] }, missing = [], byFam = {};
  for (const k of kinds) { const fam = famOf(k); for (const g of Ge.of(k)) { const R = REC[g]; const p = Ge.DEF[g].p; const has = !!(R && (R[fam] || R.any)); cov[p][1]++; if (has) cov[p][0]++; else if (p < 3) missing.push(`${k}/${g}`);
    const bf = byFam[fam] || (byFam[fam] = {}); const e = bf[g] || (bf[g] = [0, 0]); e[1]++; if (has) e[0]++; } }
  const pc = p => (cov[p][1] ? (100 * cov[p][0] / cov[p][1]).toFixed(1) : '—');
  ok('cobertura', !missing.length, `p1 ${cov[1][0]}/${cov[1][1]} (${pc(1)}%), p2 ${cov[2][0]}/${cov[2][1]} (${pc(2)}%), p3 ${cov[3][0]}/${cov[3][1]} (${pc(3)}%)` + (missing.length ? '; sem pose: ' + missing.slice(0, 20).join(', ') : ''));
  if (process.env.TABELA) for (const f in byFam) console.log(f, Object.keys(byFam[f]).length, 'gestos:', Object.entries(byFam[f]).map(([g, e]) => e[0] === e[1] ? g : g + '(' + e[0] + '/' + e[1] + ')').join(' '));
  // ---------------- each pose ----------------
  const bad = { nan: [], len: [], still: [], under: [], ground: [] }; let n = 0, worstUnder = 0, worstGround = 0;
  const neutral = {}; const EP = new Float32Array(FA.K.E.length);
  const restOf = k => { if (neutral[k]) return neutral[k]; const ps = L.pose({ kind: k, id: 7 }); neutral[k] = { E: Float32Array.from(FA.K.E), O: Float32Array.from(FA.K.OFF), low: Math.min(0, L.minY(L.skin(ps).P)) }; return neutral[k]; };
  for (const k of kinds) {
    const fam = famOf(k); const air = G.Animals.DEF[k].cls === 'air';
    for (const g of Ge.of(k)) {
      const R = REC[g]; if (!R || !(R[fam] || R.any)) continue; const d = Ge.DEF[g].d;
      const useFly = air && (R.wing || FLYMESH[g]) && D.species[k].fly; const H = forms[useFly ? D.species[k].fly : D.species[k].mesh].meta.H;
      let moved = false;
      for (const u of d > 0 ? [d * 0.15, d * 0.45, d * 0.8] : [0.4, 1.3, 2.6]) {
        n++;
        const ps = L.pose({ kind: k, g, u, id: 7, fly: useFly, ground: useFly && g !== 'stoop' });
        const E0 = Float32Array.from(FA.K.E), O0 = Float32Array.from(FA.K.OFF);
        if (!ps.R.every(m => m.elements.every(Number.isFinite))) { bad.nan.push(`${k}/${g}`); continue; }
        // (the bones' lengths: the frames turn and scale, never shear — each joint from its parent as far as modelled, by the scale)
        const J = ps.form.J; let lerr = 0; for (let b = 1; b < FA.BONES.length; b++) { const p = FA.PARENT[b]; if (p < 0) continue; const a1 = L.joint(ps, FA.BONES[b]), a0 = L.joint(ps, FA.BONES[p]);
          const l0 = Math.hypot(J[b * 3] - J[p * 3], J[b * 3 + 1] - J[p * 3 + 1], J[b * 3 + 2] - J[p * 3 + 2]); if (l0 < 1e-4) continue; const e = ps.R[p].elements; const s = Math.hypot(e[0], e[1], e[2]);
          lerr = Math.max(lerr, Math.abs(Math.hypot(a1[0] - a0[0], a1[1] - a0[1], a1[2] - a0[2]) - l0 * s) / (l0 * s)); }
        if (lerr > 0.01) bad.len.push(`${k}/${g} ${(lerr * 100).toFixed(1)}%`);
        // (different from standing: some bone turned, the body moved, the eyes shut)
        if (!useFly) { const r0 = restOf(k); let dE = 0; for (let i = 0; i < E0.length; i++) dE = Math.max(dE, Math.abs(E0[i] - r0.E[i])); const dO = Math.max(...[0, 1, 2].map(i => Math.abs(O0[i] - r0.O[i]))) / H; if (dE > 0.06 || dO > 0.01 || ps.P[FG.I.EYE] > 0.3 || ps.P[FG.I.SAC] > 0.1) moved = true; }
        else moved = true;
        if (UNDER[g] || useFly || ps.P[FG.I.LIFT] < -0.05) continue;
        // (under the ground: beyond the kind's own standing pose — the perched bird's tail, the sprawler's elbows go under as modelled: T-1301)
        const sk = L.skin(ps), low = L.minY(sk.P), tol = Math.max(0.012, H * 0.035), base = useFly ? 0 : restOf(k).low;
        if (low < base - tol) { bad.under.push(`${k}/${g}@${u.toFixed(1)} ${low.toFixed(3)}`); }
        worstUnder = Math.min(worstUnder, (low - base) / H);
        if (ps.P[FG.I.GROUND] > 0.95 && !(ps.P[FG.I.LIFT] > 0.02)) { const gap = Math.abs(low); worstGround = Math.max(worstGround, gap / H); if (gap > tol) bad.ground.push(`${k}/${g}@${u.toFixed(1)} ${low.toFixed(3)}`); }
      }
      if (!moved) bad.still.push(`${k}/${g}`);
    }
  }
  ok('números', !bad.nan.length, `${n} poses (cada par em três momentos); matrizes de números` + (bad.nan.length ? '; fora: ' + bad.nan.slice(0, 10).join(', ') : ''));
  ok('ossos', !bad.len.length, `o comprimento de cada osso mantido (sem cisalhar)` + (bad.len.length ? '; fora: ' + bad.len.slice(0, 10).join(', ') : ''));
  ok('não é ficar de pé', !bad.still.length, `todo par posa algo que a pose parada não tem` + (bad.still.length ? '; parados: ' + bad.still.slice(0, 20).join(', ') : ''));
  ok('o chão', !bad.under.length, `nada debaixo do chão além de 3,5% da altura (pior ${(worstUnder * 100).toFixed(1)}%)` + (bad.under.length ? '; fora (' + bad.under.length + '): ' + bad.under.slice(0, 14).join(', ') : ''));
  ok('deitado no chão', !bad.ground.length, `as poses deitadas assentadas no chão (pior a ${(worstGround * 100).toFixed(1)}% da altura)` + (bad.ground.length ? '; fora: ' + bad.ground.slice(0, 12).join(', ') : ''));
  // ---------------- the dead ----------------
  { const out = []; let worst = 0; for (const k of kinds) { const ps = L.pose({ kind: k, dead: 1, id: 9 }); const sk = L.skin(ps); const low = L.minY(sk.P), H = ps.form.meta.H;
      worst = Math.max(worst, Math.abs(low) / H); if (Math.abs(low) > Math.max(0.012, H * 0.035) || !(ps.P[FG.I.EYE] > 0.9)) out.push(`${k} ${low.toFixed(3)}`);
      if (famOf(k) === 'quad') { const e = ps.R[B.root].elements, up = e[5] / Math.hypot(e[4], e[5], e[6]); if (up > 0.5) out.push(`${k} de pé (o dorso para cima, ${up.toFixed(2)})`); } }
    ok('os mortos', !out.length, `${kinds.length} espécies mortas, deitadas e assentadas no chão (pior a ${(worst * 100).toFixed(1)}% da altura), os olhos fechados` + (out.length ? '; fora: ' + out.slice(0, 12).join(', ') : '')); }
  // ---------------- two bodies ----------------
  // (the held one posed where it is; its point — the throat, the nape, the back… as People3D reaches it: the skin's support point
  // of the bone, moved by the pose —; the holder set near it as the world would set two bodies by their sizes, its mouth (or its
  // feet, or its brow) reaching the point by the gesture's own reach)
  const sup = (ps, bone, dir) => { const h = ps.form.hull, b = B[bone]; const o = (b * h.nd + dir) * 3; return L.at(ps, bone, [h.p[o], h.p[o + 1], h.p[o + 2]]); };
  const inv = new THREE.Matrix4();
  function hold(o) {
    const prey = L.pose(Object.assign({ kind: o.prey, g: o.pg || 'struggle', u: 1, id: 11, x: 0, z: 0, yaw: 0, held: o.g, down: o.down || 0 }, o.preyExtra || {}));
    const T = o.point(prey);
    const hf = forms[D.species[o.kind].mesh]; const mouth = FG.mouthOf(hf, new Float32Array(3));
    // (the holder facing the point, from the side given, its mouth's reach short of it)
    const ang = o.from, reach = (o.reach !== undefined ? o.reach : mouth[2] * 0.82);
    const fx = Math.sin(ang), fz = Math.cos(ang); const X = T[0] - fx * reach, Z = T[2] - fz * reach;
    const m = new THREE.Matrix4().makeRotationY(ang).setPosition(X, 0, Z); inv.copy(m).invert();
    const aim = new THREE.Vector3(T[0], T[1], T[2]).applyMatrix4(inv);
    const ps = L.pose(Object.assign({ kind: o.kind, g: o.g, u: o.u || 1.2, id: 12, aim: [aim.x, aim.y, aim.z], x: X, z: Z, yaw: ang }, o.extra || {}));
    const P = o.tip ? o.tip(ps) : L.at(ps, 'head', mouth);
    const dist = Math.hypot(P[0] - T[0], P[1] - T[1], P[2] - T[2]); const hl = Math.hypot(hf.meta.nose[1] - hf.J[B.head * 3 + 1], hf.meta.nose[2] - hf.J[B.head * 3 + 2]); const tol = o.tol || Math.max(0.05, hl * 0.25); // (a quarter of the head's length)
    return { dist, tol, prey, ps, T, P };
  }
  const scenes = [
    { name: 'leão na garganta da zebra', kind: 'lion', g: 'throat', prey: 'zebra', from: Math.PI / 2, point: p => sup(p, 'neck2', 3) },
    { name: 'tigre na nuca do cervo', kind: 'tiger', g: 'nape', prey: 'deer', down: 1, from: Math.PI / 2, point: p => sup(p, 'neck1', 2), reach: 0.55 },
    { name: 'lobo agarrado à anca do alce', kind: 'wolf', g: 'grip', prey: 'moose', from: 0, point: p => sup(p, 'root', 9) },
    { name: 'crocodilo rolando com o gnu', kind: 'croc', g: 'deathroll', prey: 'gnu', from: -Math.PI / 2, point: p => sup(p, 'neck2', 3), u: 0.4, extra: { rollA: 0.0001 } }, // (the jaws on the throat as the roll begins)
    { name: 'leopardo puxando a carcaça', kind: 'leopard', g: 'tear', prey: 'gazelle', pg: null, preyExtra: { dead: 1 }, from: Math.PI / 2, point: p => sup(p, 'spine', 0), tol: 0.11 },
    { name: 'veado batendo cabeça com outro', kind: 'deer', g: 'clash', prey: 'deer', pg: 'clash', from: Math.PI, point: p => L.at(p, 'head', FG.browOf(p.form, [0, 0, 0])), tip: ps => L.at(ps, 'head', FG.browOf(ps.form, [0, 0, 0])), reach: 0.95, u: 1.0 },
  ];
  for (const sc of scenes) { const r = hold(sc); ok('dois corpos: ' + sc.name, r.dist <= r.tol, `a boca (a testa) a ${r.dist.toFixed(3)} m do ponto (tolerância ${r.tol.toFixed(3)} m)`); }
  // (the python's coils round the capybara: its bones of the loop at the loop's radius round the prey's middle; the eagle's
  // talons on the rabbit's back; the zebra's hind hooves thrown back and up)
  { const prey = L.pose({ kind: 'capybara', g: 'struggle', u: 1, id: 11, held: 'coil' }); const C0 = L.joint(prey, 'spine'); const hb = forms.capybara.hull, b = B.spine; const r = (hb.p[(b * hb.nd + 2) * 3 + 1] - hb.p[(b * hb.nd + 3) * 3 + 1]) * 0.5;
    const sn = forms.python, rootZ = sn.J[B.root * 3 + 2]; const ang = Math.PI / 2; const X = C0[0] - Math.sin(ang) * rootZ, Z = C0[2] - Math.cos(ang) * rootZ;
    const ps = L.pose({ kind: 'python', g: 'coil', u: 1, id: 13, x: X, z: Z, yaw: ang, coilR: r, coilY: C0[1] });
    // (the loop round the capybara's long axis, in the plane across it: the joints of its arcs round a centre near the capybara's middle, farther out than its body)
    const arc = ['tail2', 'tail1', 'tail0', 'spine', 'chest', 'neck0'].map(n => L.joint(ps, n)); const cx = arc.reduce((s, p) => s + p[0], 0) / arc.length, cy = arc.reduce((s, p) => s + p[1], 0) / arc.length;
    const ring = arc.map(p => Math.hypot(p[0] - cx, p[1] - cy)), rr = ring.reduce((s, v) => s + v, 0) / ring.length, off = Math.hypot(cx - C0[0], cy - C0[1]);
    ok('dois corpos: a jiboia enrolada na capivara', off < r * 0.8 && rr > r && rr < r * 2.4 && Math.min(...ring) > r * 0.8, `a volta com raio de ${rr.toFixed(2)} m (de ${Math.min(...ring).toFixed(2)} a ${Math.max(...ring).toFixed(2)}), o centro a ${off.toFixed(2)} m do meio da capivara (raio do corpo ${r.toFixed(2)} m)`); }
  { const prey = L.pose({ kind: 'rabbit', g: 'struggle', u: 1, id: 11, held: 'talons', down: 1 }); const T = sup(prey, 'spine', 2);
    const ps = L.pose({ kind: 'eagle', g: 'talons', u: 1, id: 14, fly: true, ground: true, x: T[0], z: T[2], yaw: 0 });
    const ft = [L.joint(ps, 'hlL3'), L.joint(ps, 'hlR3')]; const d = Math.min(...ft.map(p => Math.hypot(p[0] - T[0], p[2] - T[2]))); const hy = Math.min(...ft.map(p => p[1]));
    ok('dois corpos: a águia com as garras no coelho', d < 0.08 && hy < T[1] + 0.12, `as garras a ${d.toFixed(3)} m do dorso do coelho na horizontal, à altura ${hy.toFixed(3)} m (o dorso a ${T[1].toFixed(3)} m)`); }
  { const ps = L.pose({ kind: 'zebra', g: 'kick', u: 0.7 * 0.42, id: 15 }); const LL = (forms.zebra.J[B.flL0 * 3 + 1] + forms.zebra.J[B.hlL0 * 3 + 1]) / 2; const hip = L.joint(ps, 'hlL0'), hoof = L.joint(ps, 'hlL3');
    ok('o coice da zebra', hip[2] - hoof[2] > LL * 0.6 && hoof[1] > LL * 0.2, `o casco ${(hip[2] - hoof[2]).toFixed(2)} m atrás do quadril e ${hoof[1].toFixed(2)} m acima do chão (perna ${LL.toFixed(2)} m)`); }
  // ---------------- the cost ----------------
  { const t0 = process.hrtime.bigint(); let k = 0; for (let r = 0; r < 20; r++) for (const kd of kinds) { L.pose({ kind: kd, g: Ge.of(kd)[r % Ge.of(kd).length], u: 0.7, id: r }); k++; } const ms = Number(process.hrtime.bigint() - t0) / 1e6 / k;
    const t1 = process.hrtime.bigint(); let k1 = 0; for (let r = 0; r < 20; r++) for (const kd of kinds) { L.pose({ kind: kd, v: (r % 3) * 0.8, ph: r / 20, id: r }); k1++; } const ms1 = Number(process.hrtime.bigint() - t1) / 1e6 / k1;
    console.log(`(custo: ${ms.toFixed(3)} ms por pose com gesto, ${ms1.toFixed(3)} ms sem gesto — com a cópia das matrizes da prova)`); }
  if (fails.length) { console.log(`FALHOU: ${fails.length}`); process.exit(1); }
  console.log('PASSOU'); return;
}

if (mode === 'folha') {
  // the quick sheets: every gesture of the family on one kind of it (the kinds given, or the family's first), at its middle
  const OUT = path.resolve(process.argv[3] || 'saida-gestos'); fs.mkdirSync(OUT, { recursive: true });
  const sel = process.argv[4] || 'quad,bird,snake,sprawl,frog,seal', gsel = process.argv[5] ? new Set(process.argv[5].split(',')) : null;
  const REP = { quad: ['lion', 'zebra', 'wolf', 'deer', 'elephant', 'bear', 'giraffe', 'rabbit'], bird: ['eagle', 'galinha', 'heron', 'ostrich'], snake: ['python'], sprawl: ['croc', 'lizard'], frog: ['frog'], seal: ['seal'] };
  for (const part of sel.split(',')) {
    const list = REP[part] ? REP[part] : [part]; const cells = []; const W = 300, H = 230;
    for (const k of list) { if (!D.species[k]) continue; for (const g of Ge.of(k)) { if (gsel && !gsel.has(g)) continue; const R = REC[g]; const fam = famOf(k); if (!R || !(R[fam] || R.any)) continue;
      const d = Ge.DEF[g].d, u = d > 0 ? d * 0.42 : 1.3; const air = G.Animals.DEF[k].cls === 'air' && (R.wing || FLYMESH[g]) && D.species[k].fly;
      const ps = L.pose({ kind: k, g, u, id: 5, fly: air, ground: air && g !== 'stoop' }); const sk = L.skin(ps); const fm = ps.form; const size = Math.max(fm.meta.H, fm.meta.L * 0.7);
      const cam = L.camAt([0, 0, (fm.box[0][2] + fm.box[1][2]) / 2], size, part === 'snake' ? 'top' : 'three', air ? 1.4 : 1);
      const img = L.render([{ P: sk.P, mesh: sk.mesh, col: L.coatRGB(k) }], cam, W, H); const f = path.join(OUT, `${k}-${g}.png`); L.png(f, W, H, img); cells.push([`${k} ${g}`, f]); } }
    const sheet = path.join(OUT, `folha-${part}.png`); fs.writeFileSync(sheet + '.json', JSON.stringify(cells));
    cp.execFileSync(process.env.PY || 'python3', [path.join(__dirname, 'bichos-folha.py'), sheet, '8'], { stdio: 'inherit' });
  }
  return;
}

if (mode === 'deus') {
  // the god's view (js/fauna-art.js): each kind drawn in the gestures of the list, as the god sees them from above, on a canvas of
  // the page — a sheet; the drawing must not throw, and no gesture may be drawn as nothing
  const OUT = path.resolve(process.argv[3] || 'saida-gestos-deus'); fs.mkdirSync(OUT, { recursive: true });
  const ROOT = path.resolve(process.argv[4] || path.join(__dirname, '..', '..'));
  const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
  const KINDS = (process.env.KINDS || 'lion,zebra,wolf,deer,elephant,giraffe,croc,python,eagle,bear,buffalo,cavalo').split(',');
  const GS = (process.env.GESTOS || 'sleep,lie,drink,alert,roar,rear,kick,throat,struggle,tear,deathroll,coil,fall,throes,clash,display,spread,stoop,mate,nurse,howl,threat').split(',');
  (async () => {
    const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
    await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
    const r = await page.evaluate(o => {
      G.Save.apply(JSON.parse(G.Ready.data.cidade)); document.querySelector('#menu').classList.add('hidden');
      const cv = document.createElement('canvas'); cv.width = 64 * (o.GS.length + 1); cv.height = 64 * o.KINDS.length + 20; cv.id = 'deus'; cv.style.cssText = 'position:fixed;left:0;top:0;z-index:9999;background:#b8c890'; document.body.appendChild(cv);
      const c = cv.getContext('2d'); c.fillStyle = '#b8c890'; c.fillRect(0, 0, cv.width, cv.height); c.font = '9px sans-serif'; const out = { drawn: 0, err: [] };
      o.GS.forEach((g, j) => { c.fillStyle = '#223'; c.fillText(g, 64 * (j + 1) + 4, 10); });
      o.KINDS.forEach((k, i) => { c.fillStyle = '#223'; c.fillText(k, 4, 20 + 64 * i + 34);
        o.GS.forEach((g, j) => { const sp = G.Animals.DEF[k]; if (!sp) return; const can = G.Gestos.can(k, g);
          const a = { id: 40 + i * 7 + j, kind: k, x: 60, y: 60, face: 1, grown: 1, age: 5, moving: false, walkPh: 0, hp: 10, state: 'idle', z: g === 'stoop' ? 6 : 0, meat: sp.meat, dead: false, gest: can ? g : null, gestT: G.Gestos.DEF[g].d > 0 ? G.Gestos.DEF[g].d * 0.42 : 0.9, gestD: G.Gestos.DEF[g].d, gestO: 0, gestV: g === 'struggle' ? 1 : 0, blood: g === 'tear' ? 1 : 0, eating: 0, hurt: 0, bite: 0, roll: 0, grip: 0, down: 0 };
          c.save(); c.translate(64 * (j + 1) + 32, 20 + 64 * i + 50); c.scale(3, 3); try { G.Art.animal(c, a, 0, 0, 2.3, false); out.drawn++; } catch (e) { out.err.push(k + '/' + g + ': ' + e.message); } c.restore();
          if (!can) { c.fillStyle = 'rgba(40,40,60,0.35)'; c.fillRect(64 * (j + 1), 20 + 64 * i, 64, 64); } }); });
      return out;
    }, { KINDS, GS });
    const el = await page.$('#deus'); await el.screenshot({ path: path.join(OUT, 'deus-gestos.png') });
    await browser.close();
    console.log(`${r.drawn} desenhos; erros: ${r.err.length ? r.err.slice(0, 5).join(' · ') : 'nenhum'}; página: ${errs.slice(0, 3).join(' · ') || 'nenhum'}`);
    console.log('folha: ' + path.join(OUT, 'deus-gestos.png'));
    if (r.err.length || errs.length) { console.log('FALHOU'); process.exit(1); } console.log('PASSOU');
  })();
}

if (mode === 'jogo') {
  // the sheets by the game's renderer, in a browser (the scenes in the list SHOTS: one beast in a gesture, or two in a hold)
  const OUT = path.resolve(process.argv[3] || 'saida-gestos-jogo'); fs.mkdirSync(OUT, { recursive: true });
  const ROOT = path.resolve(process.argv[4] || path.join(__dirname, '..', '..'));
  const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
  const SHOTS = require('./gestos-cenas.js');
  const only = process.env.ONLY ? new Set(process.env.ONLY.split(',')) : null;
  (async () => {
    const VW = +process.env.VW || 360, VH = +process.env.VH || 270;
    const browser = await chromium.launch({ args: ['--js-flags=--max-old-space-size=8192', '--enable-unsafe-swiftshader'] });
    const page = await browser.newPage({ viewport: { width: VW, height: VH } });
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    page.on('console', m => { const t = m.text(); if ((m.type() === 'warning' || m.type() === 'error') && !/ERR_FAILED|fonts|GL Driver|GroupMarker|software WebGL/.test(t)) errs.push('console: ' + t.slice(0, 600)); });
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; try { localStorage.clear(); } catch (e) { } });
    await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await page.goto('file://' + path.join(ROOT, 'index.html')); await page.waitForTimeout(900);
    await page.waitForFunction(() => !(window.G && G.Ground3D && G.Ground3D.texReady) || G.Ground3D.texReady(), null, { timeout: 120000 });
    await page.addScriptTag({ path: path.join(ROOT, 'worlds', 'cidade.js') });
    const info = await page.evaluate(env => {
      G.Realm.setQuality('media'); G.Save.apply(JSON.parse(G.Ready.data.cidade)); G.Main.mode = 'game'; document.querySelector('#menu').classList.add('hidden'); G.UI.showHUD(true); G.UI.setSpeed(1); if (G.Audio) G.Audio.mute = true;
      const S = G.S, W = G.W, N = G.N; const s = [...S.settlements.values()].sort((a, b) => G.Village.pop(b.id) - G.Village.pop(a.id))[0];
      const v = [...S.villagers.values()].filter(o => o.set === s.id && o.age >= 18 && o.age < 55 && !o.inside && G.Possess.can(o).ok).sort((a, b) => a.id - b.id)[0];
      const bad = new Set(); for (const b of S.buildings.values()) for (let y = b.y - 1; y < b.y + b.h + 1; y++) for (let x = b.x - 1; x < b.x + b.w + 1; x++) bad.add(y * N + x);
      let best = null, bs = 1e9;
      for (let cy = 5; cy < N - 5; cy++) for (let cx = 5; cx < N - 5; cx++) { let okk = true, lo = 1e9, hi = -1e9;
        for (let y = cy - 3; y <= cy + 3 && okk; y++) for (let x = cx - 3; x <= cx + 3 && okk; x++) { const i = y * N + x; if (bad.has(i) || S.type[i] <= G.T.RIVER || !W.walkable(i) || (S.treeAt && S.treeAt[i]) || (S.road && S.road[i])) { okk = false; break; } const h = W.groundH(x + 0.5, y + 0.5); lo = Math.min(lo, h); hi = Math.max(hi, h); }
        const sc = (hi - lo) * 40 + Math.hypot(cx - s.cx, cy - s.cy) * 0.15; if (okk && sc < bs) { bs = sc; best = [cx + 0.5, cy + 0.5]; } }
      if (!best) return { err: 'sem chão aberto' };
      v.x = best[0] - 2.2; v.y = best[1] + 2.2; v.tx = v.x; v.ty = v.y; // (the body near enough for the beasts to be drawn as skins, behind the scene)
      const until = (c, m) => { for (let k = 0; k < m; k++) { if (c()) return k; G.Main.frameFor(33); } return -1; };
      G.Modes.enter(v); until(() => G.Modes.state === 'INC', 300); for (let k = 0; k < 6; k++) G.Main.frameFor(33); S.time = 11 / 24;
      document.querySelectorAll('#inc-hud, #hud, #inc-root, #inc-label, #inc-compass, #inc-news, .toast').forEach(e => e.style.visibility = 'hidden');
      G.Cam3D.OPT.follow = false; G.Cam3D.update = function () { }; // (the camera is the scene's: held where each shot puts it, not behind the body)
      window.__spot = best; return { spot: best, fauna: G.Fauna3D.ready };
    }, {});
    console.log(JSON.stringify(info)); if (info.err) { await browser.close(); process.exit(1); }
    const cells = []; const meas = [];
    for (const sh of SHOTS) {
      if (only && !only.has(sh.tag)) continue;
      for (const z of (process.env.ZOOM || '').split(',')) { const [t, k] = z.split(':'); if (t === sh.tag && +k > 0) sh.zoom = +k; } // (ZOOM=tag:k — a wider look at one scene, to see what is out of the frame)
      const r = await page.evaluate(sh => {
        const S = G.S, A = G.Animals; for (const a of [...S.animals.values()]) A.remove(a);
        const [x, y] = window.__spot; const TL = G.Space.TILE; const live = [];
        for (const b of sh.beasts) { const sp = A.DEF[b.kind]; const a = A.spawn(b.kind, x + (b.dx || 0) / TL, y + (b.dz || 0) / TL, { age: b.young ? 0.4 : sp.life * 0.5, grown: b.young ? 0.5 : 1, state: 'idle', t: 1e6, z: b.z || 0 });
          a.hunger = 0; a.rest = 1e6; a.scan = 1e6; a.face = b.face || 1; if (b.dead) { A.kill(a, null, 'other'); if (b.meat !== undefined) a.meat = b.meat * sp.meat; }
          if (b.blood) a.blood = b.blood; if (b.wnd) a.wnd = { b: 0, l: 0, z: b.wnd }; if (b.meio) a.meio = Object.assign({ th: 0, wet: 0, mud: 0, dust: 0, cold: 0, hot: 0 }, b.meio);
          live.push({ a, b, x: a.x, y: a.y }); }
        // (each faces where it is told: a step toward that way first, so the view's yaw turns there)
        for (const L of live) { if (L.b.yaw === undefined) continue; L.a.x = L.x - Math.cos(L.b.yaw) * 0.05 / TL; L.a.y = L.y - Math.sin(L.b.yaw) * 0.05 / TL; }
        for (let k = 0; k < 3; k++) G.Main.frameFor(33);
        const hold = () => { for (const L of live) { const a = L.a; a.x = L.x; a.y = L.y; a.tx = a.x; a.ty = a.y; if (!a.dead) { a.state = L.b.state || (A.DEF[a.kind].cls === 'air' ? ((L.b.z || 0) > 0.3 ? 'fly' : 'perch') : 'idle'); a.t = 1e6; a.scan = 1e6; a.moving = false; a.z = L.b.z || 0; if (L.b.z) a.air = true; } } };
        for (const L of live) { if (L.b.g && !L.a.dead) { const o = L.b.to !== undefined ? live[L.b.to].a.id : 0; if (!A.gesture(L.a, L.b.g, L.b.d, o, L.b.v || 0)) return { err: `gesto ${L.b.g} recusado para ${L.a.kind}: ${A.gestErr.slice(-1)}` }; } }
        // (the camera on the scene — from its side, three quarters, at its size — set before the frames: the eye's field decides who is drawn)
        const a0 = live[0].a, X = live[0].x * TL, Z = live[0].y * TL; const Y = G.People3D.groundAt ? G.People3D.groundAt(live[0].x, live[0].y) : G.W.groundH(live[0].x, live[0].y) * G.Space.HM;
        const size = Math.max(...live.map(L => G.Fauna3D.sizeOf(L.a.kind))) / (sh.zoom || 1); const D0 = Math.max(1.0, size * 2.4); const ang = sh.view === 'side' ? Math.PI / 2 : sh.view === 'front' ? 0 : sh.view === 'back' ? Math.PI : sh.view === 'top' ? 0.6 : 0.75;
        const cx = X + (sh.cx || 0), cz = Z + (sh.cz || 0), hy = Math.max(0.15, size * 0.38) + (sh.cy || 0); const cam = G.Realm.camera();
        const camSet = () => { cam.position.set(cx + Math.cos(ang) * D0, Y + hy + (sh.view === 'top' ? D0 * 0.9 : hy * 0.55), cz - Math.sin(ang) * D0); cam.lookAt(cx, Y + hy * 0.6, cz); cam.fov = 40; cam.updateProjectionMatrix(); };
        camSet();
        const steps = Math.max(1, Math.round((sh.u || 1.2) / 0.1)); for (let k = 0; k < steps; k++) { hold(); camSet(); for (const L of live) if (L.b.g && !L.a.dead && L.a.gest !== L.b.g) A.gesture(L.a, L.b.g, L.b.d, L.b.to !== undefined ? live[L.b.to].a.id : 0, L.b.v || 0); G.Main.frameFor(100); }
        hold();
        // (the measure: the holder's mouth against the point it reaches)
        let m = null; const P3 = G.People3D, FG = G.FaunaAnim.Gest;
        if (sh.measure) { const h = live[sh.measure[0]].a, o = live[sh.measure[1]].a; const hs = P3.beastVis(h.id); const which = sh.measure[2];
          if (hs && hs.kb && hs.kf) { const mo = FG.mouthOf(hs.kf, new Float32Array(3)), J = hs.kf.J, B = G.FaunaAnim.B, e = hs.kb, bi = 2 * 16, b = B.head; const xx = mo[0] - J[b * 3], yy = mo[1] - J[b * 3 + 1], zz = mo[2] - J[b * 3 + 2];
            const M = [e[bi] * xx + e[bi + 4] * yy + e[bi + 8] * zz + e[bi + 12], e[bi + 1] * xx + e[bi + 5] * yy + e[bi + 9] * zz + e[bi + 13], e[bi + 2] * xx + e[bi + 6] * yy + e[bi + 10] * zz + e[bi + 14]];
            const T = P3.keyPoint(o, which, M[0], M[2]); m = { d: Math.hypot(M[0] - T[0], M[1] - T[1], M[2] - T[2]), size: G.Fauna3D.sizeOf(h.kind), dbg: { gn: hs.gn, gk: +(hs.gk || 0).toFixed(2), hx: +(hs.hx || 0).toFixed(2), hz: +(hs.hz || 0).toFixed(2), yaw: +hs.yaw.toFixed(2), M: M.map(v => +v.toFixed(2)), T: Array.from(T).map(v => +v.toFixed(2)), at: [+(h.x * G.Space.TILE).toFixed(2), +(h.y * G.Space.TILE).toFixed(2)], gest: h.gest, o: h.gestO === o.id, w: P3.aimWhich(h.gest, h, o, P3.beastVis(o.id)), Tl: Array.from(P3.keyPoint(o, which, o.x * TL, o.y * TL + 9)).map(v => +v.toFixed(2)), Tr: Array.from(P3.keyPoint(o, which, o.x * TL, o.y * TL - 9)).map(v => +v.toFixed(2)), oyaw: +(P3.beastVis(o.id).yaw || 0).toFixed(2) } }; } }
        G.Main.frameFor(33); camSet(); G.Realm.renderer().render(G.Realm.scene(), cam);
        const chk = G.People3D.check ? G.People3D.check() : [];
        const av = G.Avatar && G.Avatar.state ? G.Avatar.state() : null;
        return { m, chk, skins: G.People3D.beastSkins, n: live.length, lastP: (() => { const FG = G.FaunaAnim.Gest; return FG.NAMES.map((n, i) => FG.P[i] ? n + "=" + FG.P[i].toFixed(2) : "").filter(Boolean).join(" "); })(), off: Array.from(G.FaunaAnim.K.OFF).map(v => +v.toFixed(3)), bv: live.map(L => { const q = G.People3D.beastVis(L.a.id); return q ? [L.a.kind, q.gn, q.side, +(q.gk || 0).toFixed(2), L.a.state, +(L.a.z || 0).toFixed(2), +(q.Y || 0).toFixed(2), q.kb ? [3, 4, 6].map(k => [12, 13, 14].map(j => +q.kb[k * 16 + j].toFixed(2))) : null] : null; }), gest: live.map(L => L.a.gest || (L.a.dead ? 'morto' : '-')), dbg: { anim: S.animals.size, mode: G.Modes.state, has: live.map(L => S.animals.has(L.a.id)), beasts: G.People3D.beasts, av: av ? [av.X / TL, av.Z / TL] : null, at: [a0.x, a0.y], err: JSON.stringify(G.modErr).slice(0, 300), fauna: G.Fauna3D.ready, rows: G.Fauna3D.rows } };
      }, sh);
      if (r.err) { console.log('FALHOU | ' + sh.tag + ' | ' + r.err); fails.push(sh.tag); continue; }
      const file = path.join(OUT, sh.tag + '.png'); await page.screenshot({ path: file, timeout: 240000 }); cells.push([sh.tag + (r.m ? ` (${r.m.d.toFixed(2)} m)` : ''), file, sh.sheet || 'outros']);
      if (r.chk.length) { console.log('FALHOU | verificador | ' + sh.tag + ': ' + r.chk.slice(0, 3).join(' · ')); fails.push(sh.tag + ' verificador'); }
      if (r.skins < r.n) { console.log(`FALHOU | ${sh.tag} | ${r.skins} de ${r.n} bichos desenhados como pele ` + JSON.stringify(r.dbg)); fails.push(sh.tag + ' pele'); }
      if (process.env.DBG) console.log(sh.tag, JSON.stringify(r.bv), r.lastP, JSON.stringify(r.off));
      // (the point moves — the prey kicks, the roll turns —: the exact reach is the node proof's; here a fifth of the holder's size)
      if (r.m) { meas.push([sh.tag, r.m.d]); const tol = sh.tol || Math.max(0.15, r.m.size * 0.2); if (r.m.d > tol) { console.log(`FALHOU | ${sh.tag} | a boca a ${r.m.d.toFixed(3)} m do ponto (tolerância ${tol.toFixed(2)}) ` + JSON.stringify(r.m.dbg)); fails.push(sh.tag + ' alcance'); } }
    }
    const chk = await page.evaluate(() => ({ err: JSON.stringify(G.modErr), gestErr: G.Animals.gestErr.slice(0, 5) }));
    await browser.close();
    if (chk.err && chk.err !== '{}') { console.log('FALHOU | erro de módulo | ' + chk.err); fails.push('modErr'); }
    if (errs.length) { console.log('FALHOU | página | ' + errs.slice(0, 5).join(' || ')); fails.push('página'); }
    // (a sheet a group: the four-legged, the hunt, the others, the dead)
    const groups = {}; for (const c of cells) (groups[c[2]] = groups[c[2]] || []).push([c[0], c[1]]);
    for (const g in groups) { const sheet = path.join(OUT, 'jogo-' + g + '.png'); fs.writeFileSync(sheet + '.json', JSON.stringify(groups[g])); try { cp.execFileSync(process.env.PY || 'python3', [path.join(__dirname, 'bichos-folha.py'), sheet, '6'], { stdio: 'inherit', env: Object.assign({}, process.env, { KEEP: '1' }) }); } catch (e) { console.log('(sem a folha ' + g + ')'); } }
    console.log('alcances: ' + meas.map(([t, d]) => `${t} ${d.toFixed(2)}`).join(', '));
    if (fails.length) { console.log(`FALHOU: ${fails.length}`); process.exit(1); }
    console.log('PASSOU');
  })();
}
