// corpo-filme: frames of the people's skin in motion, bent on the CPU by the game's own rig and the shader's own sums
// (qa/visual/corpo-rig.js), written for arte/corpo_prev.py to draw — the stride seen without a browser.
//   node qa/visual/corpo-filme.js ESTADO VELOCIDADE QUADROS PASSO SAIDA.bin [fem] [segundos antes]
// (the body walks forward along +Z at the speed, its phase at Anim.rate, its feet planted: as in the game)
const fs = require('fs');
const L0 = require('./corpo-rig.js');
const { P3, A, B3, bend, MESH, LOOK } = L0;
const [, , st = 'walk', sp0 = '1.4', n0 = '8', every0 = '6', out = '/tmp/filme.bin', fem = '', pre0 = '1', extra = ''] = process.argv;
// (extra: other meshes worn over the body, by name — 'trancas,saiaL' — bent by the same bones)
const sp = +sp0, N = +n0, every = +every0, pre = +pre0;
const L = Object.assign({}, LOOK, { fem: fem === 'fem', plant: [{ on: 0 }, { on: 0 }] }); const p = A.POSE0();
const dt = 1 / 60; const rate = A.rate(st, sp, 1); const m = MESH[L.fem ? 'corpoF' : 'corpoM'];
const wear = [m, ...extra.split(',').filter(Boolean).map(n => MESH[n])];
const frames = []; let ph = 0, z = 0;
const total = Math.round(pre / dt) + N * every;
for (let k = 0; k < total; k++) {
  const moving = /walk|run|sneak|carryWalk|wade/.test(st);
  if (moving) { ph += dt * sp * rate; z += sp * dt; } else ph += dt;
  A.blend(p, A.pose(st, moving ? ph : k * dt, sp), dt, 12);
  L.ground = /swim|tread|drown|jump|fall|climb/.test(st) ? undefined : 0;
  B3.begin(); P3.body(0, 0, 0, z, Math.PI / 2, p, L, null); B3.end();
  if (k >= total - N * every && (k - (total - N * every)) % every === 0) frames.push(wear.map(w => bend(w, 0)));
}
// (all the meshes worn as one: their points one after another, their triangles renumbered)
let nV = 0; const idx = [], zone = []; for (const w of wear) { for (let i = 0; i < w.idx.length; i++) idx.push(w.idx[i] + nV); for (let i = 0; i < w.n; i++) zone.push(w.zone[i]); nV += w.n; }
const hdr = Buffer.alloc(12); hdr.writeUInt32LE(nV, 0); hdr.writeUInt32LE(idx.length / 3, 4); hdr.writeUInt32LE(frames.length, 8);
fs.writeFileSync(out, Buffer.concat([hdr, Buffer.from(new Uint32Array(idx).buffer), Buffer.from(Uint8Array.from(zone).buffer), ...frames.map(f => Buffer.concat(f.map(a => Buffer.from(a.buffer))))]));
console.log('ok', frames.length, 'frames, rate', rate.toFixed(2), 'rad/m');
