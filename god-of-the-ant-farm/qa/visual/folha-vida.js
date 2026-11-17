// folha-vida: the sheet of the life that is seen, for the owner (22c) — the little things of the idle, the porte and the acts, each
// one a body posed by the game's own animator and rig (the lab of qa/visual/corpo-rig.js), bent on the CPU as the shader bends it,
// written for qa/visual/folha_vida.py to draw in a grid, of three quarters, with its name.
//   node qa/visual/folha-vida.js SAIDA.bin [ocio|porte|atos|tudo] [fem]
//   python3 qa/visual/folha_vida.py SAIDA.bin SAIDA.png [colunas] [yaw]
const fs = require('fs');
const L0 = require('./corpo-rig.js');
const { P3, A, B3, bend, MESH, LOOK } = L0;
const [, , out = '/tmp/folha.bin', what = 'tudo', fem = ''] = process.argv;
const P = k => Object.assign(Object.fromEntries(A.PORTE.map(q => [q, 0])), k);
// (each entry: [the name the owner reads, the state, the time of it (0..1), the porte])
const E = [];
if (what === 'ocio' || what === 'tudo') for (const k of A.OCIO_LIST) if (A.CLIPS[k]) E.push([k.replace(/^oc-/, ''), 'idle', 0.45, null, k]);
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
