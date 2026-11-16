// bichos-olhos: the beasts' faces tested without a browser (seconds, in node: js/faunamesh.js unpacked by the game's own
// unpacker) — L-1040, L-1041, D-320 to D-322:
//   every kind of the land, the water's edge and the air, in each of its meshes (on the ground; a bird of the air also in
//   flight) and each of its levels (near, the middle, far):
//     its two eyes are there;
//     its eyes show — the part of each eyeball outside the skin of its body (each point of the eye tested by a ray against the
//       body's triangles: inside when it crosses them an odd number of times) is at least OLHO (8%) of it: an eye inside the
//       head is not drawn (18 kinds had theirs there, L-1040);
//     its face is told (the eye's centre and axis, D-321), the axis out of the head and level with it, the two eyes mirrored;
//     its triangles within the level's budget (D-322: near ≤ 6000, the middle ≤ 2000, far ≤ 420).
//   node qa/visual/bichos-olhos.js [PASTA_DO_JOGO]     (an old tree for the 'antes': the eyes it had)
//   node qa/visual/bichos-olhos.js [PASTA] tabela      (and the triangles and the eyes of each kind, as a table)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..', '..')); const TABLE = process.argv[3] === 'tabela';
global.window = global; global.G = { worldHooks: [] }; window.G = G;
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
run('js/lib/three.min.js'); global.THREE = THREE;
run('js/faunamesh.js'); run('js/fauna-anim.js'); run('js/fauna3d.js');
const D = G.FAUNAMESH, Z = D.zones; const OLHO = +process.env.OLHO || 0.08;
const BUDGET = [6000, 2000, 420];
// (the kinds of the land, the water's edge and the air, and which fly: read from js/animals.js — the world's list)
const KINDS = (() => { const src = fs.readFileSync(path.join(ROOT, 'js/animals.js'), 'utf8'); const out = [];
  for (const m of src.matchAll(/^\s{4}(\w+): \{ name: [^\n]*/gm)) { const c = (m[0].match(/cls: '(\w+)'/) || [])[1]; if (c && c !== 'water') out.push([m[1], c]); }
  return out; })();
const fails = []; const ok = (name, c, info) => { if (!c || process.env.VERBOSE) console.log(`${c ? 'PASSOU' : 'FALHOU'} | bichos-olhos ${name} | ${info}`); if (!c) fails.push(name); };
// (a ray from p along d against the triangles: how many it crosses — Möller and Trumbore)
const DIR = (() => { const v = [0.5713, 0.6182, 0.5397]; const l = Math.hypot(...v); return v.map(x => x / l); })();
function crossings(T, p) {
  let n = 0; const [dx, dy, dz] = DIR;
  for (let t = 0; t < T.length; t += 9) {
    const ax = T[t], ay = T[t + 1], az = T[t + 2], e1x = T[t + 3] - ax, e1y = T[t + 4] - ay, e1z = T[t + 5] - az, e2x = T[t + 6] - ax, e2y = T[t + 7] - ay, e2z = T[t + 8] - az;
    const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x; const det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-12) continue;
    const inv = 1 / det, sx = p[0] - ax, sy = p[1] - ay, sz = p[2] - az; const u = (sx * px + sy * py + sz * pz) * inv; if (u < 0 || u > 1) continue;
    const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x; const v = (dx * qx + dy * qy + dz * qz) * inv; if (v < 0 || u + v > 1) continue;
    if ((e2x * qx + e2y * qy + e2z * qz) * inv > 1e-6) n++;
  }
  return n;
}
const rows = [];
for (const [kind, cls] of KINDS) {
  const e = D.species[kind]; if (!e) { ok(kind + ' malha', false, 'sem malha'); continue; }
  for (const mn of cls === 'air' && e.fly ? [e.mesh, e.fly] : [e.mesh]) {
    const meta = (D.forms[mn] || {}).meta || {}; const face = meta.face; const row = { kind: mn, tris: [], eye: [] };
    ok(mn + ' rosto', !!(face && face.eye && face.eye[3] > 0), face ? `olho r=${face.eye[3]} m` : 'sem o rosto dito (D-321)');
    if (face && face.ax) { const [x, y, z] = face.ax; ok(mn + ' eixo', x > 0.1 && Math.abs(Math.hypot(x, y, z) - 1) < 0.02, `eixo do olho (${x}, ${y}, ${z}): para fora da cabeça, unitário`); }
    for (let lv = 0; lv < 3; lv++) {
      const name = lv ? mn + '_' + lv : mn; const m = D.meshes[name]; if (!m) { ok(name, false, 'sem o nível ' + lv + ' (D-322)'); continue; }
      const u = G.Fauna3D.unpack(m); row.tris[lv] = m.tris;
      ok(name + ' orçamento', m.tris <= BUDGET[lv], `${m.tris} triângulos (≤ ${BUDGET[lv]})`);
      const body = []; for (let t = 0; t < u.idx.length; t += 3) { const a = u.idx[t], b = u.idx[t + 1], c = u.idx[t + 2]; if (u.zone[a] || u.zone[b] || u.zone[c]) continue; for (const i of [a, b, c]) body.push(u.pos[i * 3], u.pos[i * 3 + 1], u.pos[i * 3 + 2]); }
      const out = { [Z.olhoL]: [0, 0], [Z.olhoR]: [0, 0] };
      for (let i = 0; i < u.n; i++) { const z = u.zone[i]; if (z !== Z.olhoL && z !== Z.olhoR) continue; out[z][1]++; if (crossings(body, [u.pos[i * 3], u.pos[i * 3 + 1], u.pos[i * 3 + 2]]) % 2 === 0) out[z][0]++; }
      for (const z of [Z.olhoL, Z.olhoR]) {
        const s = z === Z.olhoL ? 'esquerdo' : 'direito'; const [o, n] = out[z]; const f = n ? o / n : 0; row.eye[lv] = Math.min(row.eye[lv] === undefined ? 1 : row.eye[lv], f);
        ok(`${name} olho ${s}`, n > 0, n ? `${n} pontos` : 'sem o olho (L-1041)');
        if (n) ok(`${name} olho ${s} à mostra`, f >= OLHO, `${(f * 100).toFixed(0)}% do olho fora da pele (≥ ${OLHO * 100}%: dentro da cabeça não se vê, L-1040)`);
      }
    }
    rows.push(row);
  }
}
if (TABLE) { console.log('malha'.padEnd(14) + 'perto  meio  longe   olho à mostra (perto/meio/longe)'); for (const r of rows) console.log(r.kind.padEnd(14) + r.tris.map(t => String(t === undefined ? '-' : t).padStart(6)).join('') + '   ' + r.eye.map(f => f === undefined ? '-' : (f * 100).toFixed(0) + '%').join(' / ')); }
const all = rows.reduce((s, r) => s + (r.tris[0] || 0), 0); const bytes = fs.statSync(path.join(ROOT, 'js/faunamesh.js')).size;
console.log(`bichos-olhos: ${rows.length} malhas · perto ${all} triângulos ao todo · js/faunamesh.js ${(bytes / 1048576).toFixed(2)} MB · ${fails.length ? fails.length + ' falhas' : 'tudo passou'}`);
if (fails.length) { console.log('FALHOU: ' + fails.slice(0, 30).join(', ') + (fails.length > 30 ? '…' : '')); process.exitCode = 1; }
