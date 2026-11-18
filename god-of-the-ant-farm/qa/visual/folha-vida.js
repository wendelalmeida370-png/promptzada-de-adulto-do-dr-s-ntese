// folha-vida: the sheet of the life that is seen, for the owner (22c) — the little things of the idle, the porte and the acts, each
// one a body posed by the game's own animator and rig (the lab of qa/visual/corpo-rig.js), bent on the CPU as the shader bends it,
// written for qa/visual/folha_vida.py to draw in a grid, of three quarters, with its name.
//   node qa/visual/folha-vida.js SAIDA.bin [ocio|porte|atos|tudo] [fem]
//   node qa/visual/folha-vida.js SAIDA.bin pares      the acts of two (D-605): a man and a woman (a grown one and a child for the lap)
//   node qa/visual/folha-vida.js SAIDA.bin grupos     the scenes (D-607): four bodies a cell — the ring of mourning, the crowd at the
//                                                     scaffold, the drill, the children's game, the greetings of four peoples
//   node qa/visual/folha-vida.js SAIDA.bin criancas   the ages side by side (D-614): a man of 30, a girl of 12, a boy of 8, a girl
//                                                     of 3 — standing, at play, laughing — in the proportions of the age (D-639)
//   python3 qa/visual/folha_vida.py SAIDA.bin SAIDA.png [colunas] [yaw] [largura da célula]
const fs = require('fs');
const L0 = require('./corpo-rig.js');
const { P3, A, B3, bend, MESH, LOOK } = L0;
const [, , out = '/tmp/folha.bin', what = 'tudo', fem = ''] = process.argv;
const P = k => Object.assign(Object.fromEntries(A.PORTE.map(q => [q, 0])), k);
// (a child's proportions as G.Feicao gives them by the age, D-639 — the numbers of feicao.js's prop, as the gestos-vida draws them —
// and the size of the age (People3D's lookFill); a rig of before D-614 reads only the head of them)
const SM = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const PROP = age => { const ch = 1 - SM(0, 15, age), hk = 1 - SM(0, 13, age); const cab = 1 + 0.3 * hk, per = 1 - 0.22 * ch, bra = 1 - 0.12 * ch; return { headK: cab, legK: per, armK: bra, trunkK: (1.75 - 0.92 * per - 0.21 * cab) / 0.62 }; };
const KID = (L, age, s) => Object.assign({}, L, { s }, PROP(age));
// ------------------------------ many bodies a cell: the pairs and the scenes (22c onda 2) ------------------------------
// each cell: bodies [mesh, look, X, Z, yaw, state, time 0..1, the other's index for the hands (or -1), the part of two] posed by the
// game's animator, each one's hands to the other by the frame's own aim (People3D.duoAim) from the other's chest — the bodies of a
// cell written one after another (the same meshes, in the same order, in every cell of a sheet: the triangles once — a girl for the
// child taken up, so the second body is a woman's mesh in every cell)
if (what === 'pares' || what === 'grupos' || what === 'criancas') {
  const THREE = L0.THREE, M0 = () => new THREE.Matrix4(); const LM = Object.assign({}, LOOK, { fem: false, s: 1 }), LF = Object.assign({}, LOOK, { fem: true, s: 0.95 }), LK = KID(LOOK, 8, 1.2 / 1.75);
  const cells = [], names = []; const KIND = what === 'pares' ? 2 : 4;
  if (what === 'criancas') { // (the man, the girl of 12, the boy of 8, the girl of 3: the size and the proportions of each age)
    const AGES = [[MESH.corpoM, LM], [MESH.corpoF, KID(LF, 12, 1.45 / 1.75 * 0.97)], [MESH.corpoM, KID(LM, 8, 1.2 / 1.75)], [MESH.corpoF, KID(LF, 3, 0.92 / 1.75 * 0.97)]];
    const row = (st, u) => AGES.map(([m, L], i) => [m, L, (i - 1.5) * 0.7, 0, Math.PI / 2, st ? { clip: st } : null, u + 0.1 * i, -1]);
    cells.push(row(null, 0.3)); names.push('30, 12, 8 e 3 anos, parados');
    cells.push(row('brincar', 0.3)); names.push('brincando');
    cells.push(row('soc-rir', 0.4)); names.push('rindo');
    cells.push(row('soc-chamar', 0.4)); names.push('chamando');
  }
  const SA = { hug: 0.45, kiss: 0.35, console: 0.6, handhold: 0.5, carry: 0.4, toast: 0.9, shove: 0.7, separate: 0.8 };
  if (what === 'pares') {
    for (const act of ['hug', 'kiss', 'console', 'handhold', 'carry', 'toast', 'shove', 'separate']) { const d = A.DUO[act]; const ea = d.a, eb = d.b || (act === 'console' ? { clip: 'mourn' } : act === 'carry' ? A.DUO.carried.b : null);
      const kid = act === 'carry'; const mid = (ea.win[0] + ea.win[1]) / 2;
      cells.push([[MESH.corpoM, LM, 0, 0, Math.PI / 2, ea, mid, 1], [MESH.corpoF, kid ? KID(LF, 8, 0.69) : LF, 0, SA[act], -Math.PI / 2, eb, mid, 0]]); names.push(act); }
    for (const k of ['aperto', 'antebraco', 'reverencia', 'baixa']) { const e = A.GREET[k], o = k === 'baixa' ? A.GREET.nobre : e; const mid = e.hands ? (e.win[0] + e.win[1]) / 2 : 0.5;
      cells.push([[MESH.corpoM, LM, 0, 0, Math.PI / 2, e, mid, e.hands ? 1 : -1], [MESH.corpoF, LF, 0, 0.95, -Math.PI / 2, o, mid, o.hands ? 0 : -1]]); names.push('cumprimento ' + k); }
  } else if (what === 'grupos') {
    const ring = (sts, r) => sts.map((st, i) => { const a = i / sts.length * Math.PI * 2 + 0.4; return [i % 2 ? MESH.corpoF : MESH.corpoM, i % 2 ? LF : LM, Math.cos(a) * r, Math.sin(a) * r, a + Math.PI, { clip: st }, 0.3 + 0.17 * i, -1]; });
    cells.push(ring(['ato-chorar-joelhos', 'mourn', 'ato-luto-roda', 'ato-luto-roda'], 1.1)); names.push('a roda do luto');
    const row = (sts, gap, yaw) => sts.map((st, i) => [i % 2 ? MESH.corpoF : MESH.corpoM, i % 2 ? LF : LM, (i - 1.5) * gap, 0, yaw, { clip: st }, 0.2 + 0.23 * i, -1]);
    cells.push(row(['fam-festa', 'ato-vaia', 'mourn', 'ato-olhar-longe'], 0.75, Math.PI / 2)); names.push('a multidao no cadafalso');
    cells.push(row(['ato-treino', 'ato-treino', 'ato-treino', 'ato-treino'], 0.85, Math.PI / 2)); names.push('o treino (cada um na sua fase)');
    cells.push(row(['ato-alegria', 'fam-festa', 'dance', 'ato-alegria'], 0.8, Math.PI / 2)); names.push('a festa');
    const LG = KID(LF, 8, 1.2 / 1.75 * 0.97); cells.push([[MESH.corpoM, LK, -1.35, 0, 1.2, { clip: 'brincar' }, 0.3, -1], [MESH.corpoF, LG, -0.45, 0, 1.9, { clip: 'soc-rir' }, 0.4, -1], [MESH.corpoM, LK, 0.45, 0, Math.PI / 2, { clip: 'crianca-cao' }, 0.5, -1], [MESH.corpoF, LG, 1.35, 0, 2.2, { clip: 'brincar' }, 0.7, -1]]); names.push('as criancas (e o cao, fora da folha)');
  }
  const first = cells[0]; const meshes = first.map(b => b[0]); const ns = meshes.map(m => m.n); const N = ns.reduce((x, y) => x + y, 0);
  const tri = []; let off = 0; for (const m of meshes) { for (const i of m.idx) tri.push(i + off); off += m.n; }
  const zone = new Uint8Array(N); off = 0; for (const m of meshes) { zone.set(m.zone, off); off += m.n; }
  const frames = [];
  for (const cell of cells) {
    const B = cell.map(([m, L0b, X, Z, yaw, e, u, other]) => ({ m, L: Object.assign({}, L0b, { plant: [{ on: 0 }, { on: 0 }], ground: 0, gnd: null, held: null, carry: false, reach: null, pair: null, duo: null, lod: 0 }), X, Z, yaw, e, u, other, a: A.memory(), p: A.POSE0(), I: {}, s: { chM: M0() } }));
    const dt = 1 / 60;
    for (let k = 0; k < 120; k++) { const t = k * dt; for (const b of B) { const C = b.e && b.e.clip && A.CLIPS[b.e.clip]; const st = C ? b.e.clip : b.e && b.e.clip ? b.e.clip : 'idle';
      Object.assign(b.I, { st, t, sp: 0, yaw: b.yaw, yawV: 0, acc: 0, X: b.X, Z: b.Z, ground: 0, s: b.L.s, run: 0, walk: 0, over: null, overK: undefined, clipK: C ? Math.min(b.u, t / 1.6 * b.u + 1e-4) : undefined, drunk: 0, tired: 0, id: 7 + k * 0 });
      A.drive(b.a, b.I, b.p, b.L, dt); } }
    for (const b of B) { b.L.duo = null; b.s.chM.copy(P3.rig(b.X, 0, b.Z, b.yaw, b.p, b.L)[P3.B.chest]); b.s.X = b.X; b.s.Z = b.Z; }
    for (const b of B) if (b.other >= 0 && b.e && b.e.hands) b.L.duo = P3.duoAim(b.s, { e: b.e, o: B[b.other].s, k: A.duoW(b.e, b.u) }, 0);
    B3.begin(); B.forEach((b, i) => P3.body(i, b.X, 0, b.Z, b.yaw, b.p, b.L, null)); B3.end();
    const f = new Float32Array(N * 3); off = 0; B.forEach((b, i) => { const q = bend(b.m, i); if (process.env.BBOX) { const lo = [9, 9, 9], hi = [-9, -9, -9]; for (let j = 0; j < q.length; j++) { lo[j % 3] = Math.min(lo[j % 3], q[j]); hi[j % 3] = Math.max(hi[j % 3], q[j]); } console.log(names[frames.length], i, lo.map(x => x.toFixed(2)).join(','), hi.map(x => x.toFixed(2)).join(',')); } f.set(q, off * 3); off += b.m.n; }); frames.push(f);
  }
  const hdr = Buffer.alloc(12); hdr.writeUInt32LE(N, 0); hdr.writeUInt32LE(tri.length / 3, 4); hdr.writeUInt32LE(frames.length, 8);
  fs.writeFileSync(out, Buffer.concat([hdr, Buffer.from(new Uint32Array(tri).buffer), Buffer.from(zone.buffer), ...frames.map(f => Buffer.from(f.buffer))]));
  fs.writeFileSync(out + '.json', JSON.stringify(names)); console.log('ok', frames.length, 'cenas de', KIND, 'corpos →', out); process.exit(0);
}
// (each entry: [the name the owner reads, the state, the time of it (0..1), the porte])
const E = [];
if (what === 'ocio' || what === 'tudo') for (const k of A.OCIO_LIST) if (A.CLIPS[k]) E.push([k.replace(/^oc-/, ''), 'idle', 0.45, null, k]);
// (the hands on the hips: the figure's choice at the moment of the arms crossed, for one who wears nothing over the arms — D-613)
if ((what === 'ocio' || what === 'tudo') && A.CLIPS['oc-maos-cintura'] && !A.OCIO_LIST.includes('oc-maos-cintura')) E.push(['maos-cintura (bracos cruzados sem capa)', 'idle', 0.45, null, 'oc-maos-cintura']);
if (what === 'porte' || what === 'tudo') for (const [n, p] of [['parado', P({})], ['velho', P({ velho: 1 })], ['criança', P({ crianca: 1 })], ['cansado', P({ cansado: 1 })], ['frio', P({ frio: 1 })], ['calor', P({ calor: 1 })], ['chuva', P({ chuva: 1 })], ['doente', P({ doente: 1 })], ['ferido', P({ ferido: 1 })], ['manco', P({ manca: 1 })], ['grávida', P({ gravida: 1 })], ['luto', P({ luto: 1 })], ['medo', P({ medo: 1 })], ['fúria', P({ furia: 1 })], ['tímido', P({ confia: -1 })], ['nobre', P({ nobre: 1 })]]) E.push([n, 'idle', 0, p, null]);
if (what === 'atos' || what === 'tudo') for (const k of Object.keys(A.CLIPS).filter(k => /^(fam-|ato-|soc-|posto|brincar|bound-andar)/.test(k) && !/~m$/.test(k)).sort()) E.push([k.replace(/^(ato|soc)-/, ''), k, 0.4, null, null]);
const L = Object.assign({}, LOOK, { fem: fem === 'fem', s: fem === 'fem' ? 0.95 : 1 }); const m = MESH[L.fem ? 'corpoF' : 'corpoM'];
const frames = [], names = [];
for (const [name, st, u, porte, over] of E) {
  const Lw = Object.assign({}, L, { plant: [{ on: 0 }, { on: 0 }], ground: 0, gnd: null, held: null, carry: false, reach: null, pair: null, lod: 0 });
  const an = A.memory(), p = A.POSE0(), I = {}; const C = A.CLIPS[st] || A.CLIPS[over]; const dur = C ? C.dur : 1; const dt = 1 / 60;
  // (from standing, the state or the little thing at its time: driven, the porte eased in, as the frame does it)
  for (let k = 0; k < 90; k++) { const t = k * dt; const uu = Math.min(u, t / 1.5 * u + 0.0001); Object.assign(I, { st, t, sp: 0, yaw: Math.PI / 2, yawV: 0, acc: 0, X: 0, Z: 0, ground: 0, s: Lw.s, run: 0, walk: 0, over: over || null, overK: over ? Math.min(u, (k / 89) * u) : undefined, clipK: C && !over ? (C.loop ? uu : uu) : undefined, drunk: 0, tired: porte ? porte.cansado : 0, id: 7, porte, clock: t, lefty: false }); A.drive(an, I, p, Lw, dt); }
  B3.begin(); P3.body(0, 0, 0, 0, Math.PI / 2, p, Lw, null); B3.end(); frames.push(bend(m, 0)); names.push(name);
}
const hdr = Buffer.alloc(12); hdr.writeUInt32LE(m.n, 0); hdr.writeUInt32LE(m.idx.length / 3, 4); hdr.writeUInt32LE(frames.length, 8);
fs.writeFileSync(out, Buffer.concat([hdr, Buffer.from(new Uint32Array(m.idx).buffer), Buffer.from(m.zone.buffer, m.zone.byteOffset, m.n), ...frames.map(f => Buffer.from(f.buffer))]));
fs.writeFileSync(out + '.json', JSON.stringify(names));
console.log('ok', frames.length, 'poses →', out);
