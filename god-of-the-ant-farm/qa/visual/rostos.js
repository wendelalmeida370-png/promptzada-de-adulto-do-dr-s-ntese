// rostos: the faces and the bodies of the people tested without a browser (22a — D-553 to D-556), through the skin bent on the CPU
// as the shader bends it (qa/visual/corpo-rig.js) and the shapes summed as the shader sums them (G.Body3D.morphOf):
//   r1 os alvos       every target of G.Feicao on every mesh: numbers, inside a box, the eyes followed whole or grown
//   r2 a pálpebra     the closed lids cover the globe — rays from the front find no eye behind them —, with the eyes of every
//                     extreme of the face's genes; open, they see the eye
//   r3 a boca         at rest the mouth closes — rays from the front find no inside of the mouth —; open, they find its dark,
//                     the teeth, the tongue; and the open jaw does not go into the neck
//   r4 o cabelo e o chapéu  no hair and no hat lets the head through it, for every face of the genes taken to its edge and a
//                     hundred faces of real genomes (counted against the same hair on the head of no shape)
//   r5 o pano         the skirts, the toga, the blouse keep a fat body and a pregnant one inside them (against the same cloth on
//                     the body of no shape)
//   r6 o coto         a lost arm, a lost leg: what was past the cut is gone into a round end near it
//   r7 a feição       G.Feicao.of: the same person twice is the same; the colour of the genome; the height in its ±8%; a
//                     child's face firming into its own; a starving body thinner, a smith's stronger, nobody's by the house
//   node qa/visual/rostos.js
const path = require('path'), fs = require('fs'), vm = require('vm');
const L0 = require('./corpo-rig.js'); const { G, THREE, P3, B3, A, bend, MESH } = L0;
const ROOT = path.resolve(__dirname, '..', '..');
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
if (!G.Rosto) run('js/rosto.js');
if (!G.Genoma) run('js/genoma.js');
const Fe = G.Feicao, RI = G.Rosto.IDX, NT = Fe.NT, X = Fe.IDX;
const fails = []; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | rostos ${name} | ${info}`); if (!c) fails.push(name); };
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean); const want = k => !ONLY.length || ONLY.includes(k);
const D = G.BODYMESH, face = D.face; const v2 = D.v >= 2 && !!face;

// a body posed at the origin facing +Z, with a shape (w: the weights of G.Feicao.ALVOS) and a face (the channels of G.Rosto)
function posed(o) {
  o = o || {}; const L = Object.assign({}, L0.LOOK, o.look || {}); const p = A.POSE0(); if (o.st === 'bind') Object.assign(p, { elL: 0, elR: 0, knL: 0, knR: 0, shLr: D.roll - 0.05, shRr: -(D.roll - 0.05) }); else if (o.st !== 'rest') Object.assign(p, A.pose(o.st || 'idle', 0.3, 0));
  L.ground = 0; L.fe = { w: o.w || new Float32Array(NT), girth: o.girth || 1 };
  const fc = G.Rosto.fresh(); for (const k in (o.face || {})) fc[RI[k]] = o.face[k]; p.face = fc;
  B3.begin(); P3.body(0, 0, 0, 0, Math.PI / 2, p, L, null); B3.end();
  return { L, p };
}
// a mesh bent as the shader bends it: the shapes summed (morphOf) on the points as modelled, then the skin, the cloth
function bentM(name, w, girth) {
  const m = MESH[name]; const d = B3.morphOf(name, w); const keep = m.pos;
  if (d) { const q = new Float32Array(keep.length); for (let i = 0; i < q.length; i++) q[i] = keep[i] + d[i]; m.pos = q; }
  const buf = B3._buf(), at = (B3.bones().length * 3 + 21) * 4 + 1, s0 = buf[at]; if (girth) buf[at] = s0 * girth; // (the shader's cloth: s × the girth)
  try { return bend(m, 0); } finally { m.pos = keep; buf[at] = s0; }
}
// the first thing a ray meets (Möller–Trumbore), among the triangles of the meshes given: [t, zone]
function hit(meshes, o, d, far) {
  let best = far ? -1 : 1e9, bz = -1;
  for (const { m, P, tris } of meshes) for (const t of tris) {
    const a = m.idx[t * 3], b = m.idx[t * 3 + 1], c = m.idx[t * 3 + 2];
    const ax = P[a * 3], ay = P[a * 3 + 1], az = P[a * 3 + 2];
    const e1x = P[b * 3] - ax, e1y = P[b * 3 + 1] - ay, e1z = P[b * 3 + 2] - az, e2x = P[c * 3] - ax, e2y = P[c * 3 + 1] - ay, e2z = P[c * 3 + 2] - az;
    const px = d[1] * e2z - d[2] * e2y, py = d[2] * e2x - d[0] * e2z, pz = d[0] * e2y - d[1] * e2x; const det = e1x * px + e1y * py + e1z * pz; if (Math.abs(det) < 1e-12) continue;
    const inv = 1 / det, tx = o[0] - ax, ty = o[1] - ay, tz = o[2] - az; const u = (tx * px + ty * py + tz * pz) * inv; if (u < 0 || u > 1) continue;
    const qx = ty * e1z - tz * e1y, qy = tz * e1x - tx * e1z, qz = tx * e1y - ty * e1x; const v = (d[0] * qx + d[1] * qy + d[2] * qz) * inv; if (v < 0 || u + v > 1) continue;
    const tt = (e2x * qx + e2y * qy + e2z * qz) * inv; if (tt > 1e-6 && (far ? tt > best : tt < best)) { best = tt; bz = m.zone[a]; }
  }
  return [best, bz];
}
// the triangles of a mesh within a box (the head, the face): what the rays look at
function near(name, P, lo, hi) { const m = MESH[name]; const tris = []; for (let t = 0; t < m.idx.length / 3; t++) { const a = m.idx[t * 3]; if (P[a * 3] > lo[0] && P[a * 3] < hi[0] && P[a * 3 + 1] > lo[1] && P[a * 3 + 1] < hi[1] && P[a * 3 + 2] > lo[2] && P[a * 3 + 2] < hi[2]) tris.push(t); } return { m, P, tris }; }
const w0 = () => new Float32Array(NT);
const EXT = ['olhosAfast', 'olhoTam', 'palpebra', 'olhosFundos', 'arcada', 'macas', 'cranio', 'rostoLongo'];

if (!v2) { ok('o bodymesh v2 (a cabeça nova)', false, `js/bodymesh.js v${D.v}, sem face: gere de novo (arte/corpo.py corpoM corpoF corpoM_1 corpoF_1)`); }
else {
  // ------------------------------ r1 the targets ------------------------------
  if (want('r1')) {
    let bad = 0, big = 0, moved = 0, worst = 0, wn = ''; const Mo = B3._morph;
    for (let i = 0; i < Mo.buf.length; i++) if (!Number.isFinite(Mo.buf[i])) bad++;
    // (each target within its own reach: the face's a few centimetres, the body's a span, a stump's the limb it takes in)
    for (let m = 0; m < Mo.names.length; m++) for (let k = 0; k < NT; k++) { const h = (m * NT + k) * 4, o = Mo.hdr[h], c = Mo.hdr[h + 2]; if (o < 0) continue; const T = Fe.ALVOS[k];
      const lim = /^coto/.test(T.name) ? 0.7 : T.kind === 'corpo' ? 0.2 : 0.035;
      for (let i = 0; i < c; i++) { const j = (o + i) * 4, l = Math.hypot(Mo.buf[j], Mo.buf[j + 1], Mo.buf[j + 2]); if (l > 0) moved++; if (l > lim) { big++; if (l > worst) { worst = l; wn = T.name + ' em ' + Mo.names[m]; } } } }
    // (the eyeballs move whole with the targets that move them: the globe keeps its shape)
    const d = B3.morphOf('corpoM', Object.assign(w0(), { [X.olhosAfast]: 1 })); const m = MESH.corpoM; let spread = 0; const eyeD = [];
    for (let i = 0; i < m.n; i++) if (m.zone[i] === 26) eyeD.push([d[i * 3], d[i * 3 + 1], d[i * 3 + 2]]);
    for (const q of eyeD) spread = Math.max(spread, Math.hypot(q[0] - eyeD[0][0], q[1] - eyeD[0][1], q[2] - eyeD[0][2]));
    ok('r1 os alvos', !bad && !big && moved > 1000 && spread < 1e-6 && Math.abs(eyeD[0][0] - 0.0035) < 0.0008,
      `${NT} alvos em ${Mo.names.length} malhas: ${B3.MORPH.texels} texels (${(B3.MORPH.bytes / 1048576).toFixed(1)} MB na placa), feitos em ${B3.MORPH.ms.toFixed(0)} ms · números inválidos ${bad} · deslocamentos além do alcance de cada alvo (o rosto 3,5 cm, o corpo 20 cm, o coto 70 cm) ${big}${big ? ` (o maior ${(worst * 100).toFixed(1)} cm, ${wn})` : ''} · o olho afastado anda inteiro (${(eyeD[0][0] * 1000).toFixed(1)} mm, desvio ${spread.toExponential(1)})`);
  }
  // ------------------------------ r2 the lids ------------------------------
  if (want('r2')) {
    const cases = [['nenhum', w0()]]; for (const n of EXT) for (const s of [-2, 2]) cases.push([`${n} ${s > 0 ? '+' : '−'}`, Object.assign(w0(), { [X[n]]: s * 0.45 })]);
    let leak = 0, seen = 0, worst = '', shot = 0;
    for (const [name, w] of cases) for (const [blink, mustSee] of [[1, false], [0, true]]) {
      posed({ w, face: { blink } }); const P = bentM('corpoM', w);
      const H = [near('corpoM', P, [-0.09, 1.64, 0.02], [0.09, 1.77, 0.2])];
      let eye = 0, rays = 0;
      for (const sd of [1, -1]) { const c = face.eyes[sd > 0 ? 0 : 1];
        for (let i = -6; i <= 6; i++) for (let j = -5; j <= 5; j++) { const o = [c[0] + i * 0.0018, c[1] + j * 0.0018, 0.4]; const [t, z] = hit(H, o, [0, 0, -1]); rays++; if (z === 26 || z === 27) eye++; } }
      shot += rays; if (mustSee) { if (eye > 20) seen++; } else if (eye > 0) { leak++; if (!worst) worst = `${name}: ${eye} de ${rays} raios acham o olho`; }
    }
    ok('r2 a pálpebra fechada cobre o globo', leak === 0 && seen === cases.length,
      `${cases.length} rostos (os extremos dos genes do olho e da testa): fechados, ${leak ? 'O OLHO À MOSTRA — ' + worst : 'nenhum raio acha o olho'}; abertos, ${seen} de ${cases.length} veem o olho · ${shot} raios`);
    // (the calm eye, D-557, D-558: at rest the upper lid over the top of the iris — a tenth or so of it — and the lower one at its rim, no
    // white above or below; wide, the white above it — rays from the front down the middle of each eye, against the painted iris)
    const r = face.eyeR, iris = r * Math.sqrt(1 - 0.809 * 0.809), col = f => { posed({ w: w0(), face: f }); const P = bentM('corpoM', w0()); const H = [near('corpoM', P, [-0.09, 1.64, 0.02], [0.09, 1.77, 0.2])]; const out = [];
      for (const c of face.eyes) { let top = -1, bot = 1; for (let j = -60; j <= 60; j++) { const dy = j * 0.0004; const [t, z] = hit(H, [c[0], c[1] + dy, 0.4], [0, 0, -1]); if (z === 26 || z === 27) { top = Math.max(top, dy); bot = Math.min(bot, dy); } } out.push([(iris - top) / (2 * iris), (bot + iris) / (2 * iris)]); } return out; };
    const rest = col({}), wide = col({ wide: 1 });
    const calm = rest.every(([u, l]) => u >= 0.07 && u <= 0.2 && Math.abs(l) <= 0.07), awe = wide.every(([u]) => u < -0.02);
    ok('r2 o olho calmo no repouso, o branco só no arregalado', calm && awe, `em repouso a pálpebra de cima cobre ${rest.map(([u]) => (u * 100).toFixed(0) + '%').join(' e ')} da íris (de 7 a 20%), a de baixo a ${rest.map(([, l]) => (l * 100).toFixed(0) + '%').join(' e ')} da borda dela (até 7%) · arregalado: ${wide.map(([u]) => (u < 0 ? 'branco acima, ' + (-u * 100).toFixed(0) + '%' : 'SEM branco acima')).join(' e ')}`);
  }
  // ------------------------------ r3 the mouth ------------------------------
  if (want('r3')) {
    const rays = (P, w) => { const H = [near('corpoM', P, [-0.06, 1.54, 0.03], [0.06, 1.68, 0.2])]; let inside = 0, n = 0; for (let i = -10; i <= 10; i++) for (let j = -6; j <= 6; j++) { const [t, z] = hit(H, [i * 0.0022, 1.6145 + j * 0.0012, 0.4], [0, 0, -1]); n++; if (z === 23 || z === 24 || z === 25) inside++; } return [inside, n]; };
    const out = []; let closed = true, opens = true, neck = 0;
    for (const [name, w] of [['nenhum', w0()], ['lábios +', Object.assign(w0(), { [X.labios]: 0.9 })], ['boca larga', Object.assign(w0(), { [X.bocaLarga]: 0.8 })], ['velho', Object.assign(w0(), { [X.velho]: 1, [X.anciao]: 1 })], ['criança', Object.assign(w0(), { [X.infancia]: 1 })]]) {
      posed({ w }); let [a, n] = rays(bentM('corpoM', w), w); if (a > 0) closed = false;
      posed({ w, face: { jaw: 1 } }); const P = bentM('corpoM', w); const [b] = rays(P, w); if (b < 20) opens = false;
      // (the open jaw stays out of the neck: no point of the chin within the neck's round below the jaw)
      const m = MESH.corpoM; for (let i = 0; i < m.n; i++) { if (m.zone[i] !== 0) continue; const y = P[i * 3 + 1], z = P[i * 3 + 2], x = P[i * 3]; if (m.pos[i * 3 + 2] > 0.06 && m.pos[i * 3 + 1] < 1.6 && m.pos[i * 3 + 1] > 1.53 && y < 1.53 && Math.hypot(x, z + 0.01) < 0.045) neck++; }
      out.push(`${name}: fechada ${a}/${n}, aberta ${b}`);
    }
    ok('r3 a boca: fecha em repouso, abre por dentro, a mandíbula fora do pescoço', closed && opens && neck === 0, `${out.join(' · ')} · pontos do queixo no pescoço: ${neck}`);
  }
  // ------------------------------ r4 hair and hats ------------------------------
  // (the rays of r4 and r5 look only at the triangles of their bin — the piece's triangles kept by the directions they span: from
  // the head's middle, or round the hips' line)
  const binned = (m, P, key, NA, NB) => { const B = Array.from({ length: NA * NB }, () => []);
    for (let t = 0; t < m.idx.length / 3; t++) { let a0 = 1e9, a1 = -1e9, b0 = 1e9, b1 = -1e9; const ks = [];
      for (let q = 0; q < 3; q++) { const i = m.idx[t * 3 + q]; ks.push(key(P[i * 3], P[i * 3 + 1], P[i * 3 + 2])); }
      // (a triangle across the seam of the angle goes in both ends)
      let as = ks.map(k => k[0]); if (Math.max(...as) - Math.min(...as) > NA / 2) as = as.map(a => (a < NA / 2 ? a + NA : a));
      for (const a of as) { a0 = Math.min(a0, a); a1 = Math.max(a1, a); } for (const k of ks) { b0 = Math.min(b0, k[1]); b1 = Math.max(b1, k[1]); }
      for (let a = Math.floor(a0); a <= Math.floor(a1); a++) for (let b = Math.max(0, Math.floor(b0)); b <= Math.min(NB - 1, Math.floor(b1)); b++) B[((a % NA) + NA) % NA * NB + b].push(t); }
    return { m, P, B, NA, NB, key }; };
  const hitB = (H, o, d, k, far) => { const a = ((Math.floor(k[0]) % H.NA) + H.NA) % H.NA, b = Math.max(0, Math.min(H.NB - 1, Math.floor(k[1]))); return hit([{ m: H.m, P: H.P, tris: H.B[a * H.NB + b] }], o, d, far); };
  if (want('r4')) {
    // (a point of the scalp out past the hair or the hat that covers it: along the ray from the head's middle, the scalp farther
    // than the piece — counted for the head of no shape and for each face; a face may never let more through than none)
    const HC = [0, 1.69, -0.01], NA = 72, NB = 36;
    const sph = (x, y, z) => { const dx = x - HC[0], dy = y - HC[1], dz = z - HC[2]; return [(Math.atan2(dx, dz) / (2 * Math.PI) + 0.5) * NA, (Math.atan2(dy, Math.hypot(dx, dz)) / Math.PI + 0.5) * NB]; };
    const scalp = MESH.corpoM; const scalpIdx = []; for (let i = 0; i < scalp.n; i++) if (scalp.zone[i] === 0 && scalp.pos[i * 3 + 1] > 1.72) scalpIdx.push(i);
    const pieces = (process.env.DBGP ? [process.env.DBGP] : ['curto', 'longo', 'trancas', 'coque', 'rabo', 'chanel', 'peruca', 'entradas', 'crespo', 'cacheado', 'ondulado', 'gorro', 'elmo', 'chapeu', 'capuz', 'lenco', 'galea', 'nemes', 'coroa', 'louro', 'penacho']).filter(n => MESH[n]);
    const HAIR = new Set(['curto', 'longo', 'trancas', 'coque', 'rabo', 'chanel', 'peruca', 'entradas', 'crespo', 'cacheado', 'ondulado']), OPEN = new Set(['penacho', 'louro', 'coroa']);
    const faces = [['nenhum', w0()]]; for (const n of ['cranio', 'testa', 'orelhas', 'rostoLongo']) for (const s of [-2.2, 2.2]) faces.push([`${n} ${s > 0 ? '+' : '−'}`, Object.assign(w0(), { [X[n]]: s * 0.4 })]);
    faces.push(['criança', Object.assign(w0(), { [X.infancia]: 1 })], ['criança 6', Object.assign(w0(), { [X.infancia]: 1 - 0.352 })], ['velho', Object.assign(w0(), { [X.velho]: 1, [X.anciao]: 1 })]);
    for (let k = 0; k < 30; k++) faces.push(['genoma ' + k, Fe.of({ id: 9000 + k, age: 30, g: k % 2 ? 'f' : 'm', genoma: G.Genoma.founder(9000 + k, ['nordico', 'grego', 'romano', 'egipcio', 'asteca'][k % 5], 0, 4242) }).w]);
    const base = {}, report = []; let worse = 0, tested = 0;
    for (const [fname, w] of faces) {
      posed({ w }); const S = bentM('corpoM', w);
      for (const name of pieces) {
        // (the baby's face only under hair; a child's — six years — under the hood and the cap of the cold and a child ruler's crown:
        // the helmets and the hats of the trades are the grown ones', look3d.js)
        if (fname === 'criança' && !HAIR.has(name)) continue;
        if (fname === 'criança 6' && !HAIR.has(name) && !['capuz', 'gorro', 'coroa'].includes(name)) continue;
        const H = binned(MESH[name], bentM(name, w), sph, NA, NB); let out = 0;
        for (const i of scalpIdx) { const x = S[i * 3], y = S[i * 3 + 1], z = S[i * 3 + 2]; const dx = x - HC[0], dy = y - HC[1], dz = z - HC[2], l = Math.hypot(dx, dy, dz);
          const [t] = hitB(H, HC, [dx / l, dy / l, dz / l], sph(x, y, z), true); tested++; if (t > 0.06 && t < 1 && l > t + 0.001) { out++; if (process.env.DBG && fname === process.env.DBG && name === process.env.DBGP) console.log('out', name, fname, scalp.pos[i * 3].toFixed(3), scalp.pos[i * 3 + 1].toFixed(3), scalp.pos[i * 3 + 2].toFixed(3), 'scalp', l.toFixed(4), 'piece', t.toFixed(4)); } } // (past the piece's outer face: the last it meets)
        // (an open headdress — the feathers, the laurel, a crown — does not cover the head: only the band must not sink in, a little)
        if (base[name] === undefined) base[name] = out; else if (out > base[name] + 2 + (OPEN.has(name) ? base[name] * 0.15 : 0)) { worse++; if (report.length < 6) report.push(`${name} com ${fname}: ${out} pontos da cabeça para fora (sem forma: ${base[name]})`); }
      }
    }
    ok('r4 o cabelo e o chapéu sem a cabeça passar', worse === 0, `${pieces.length} peças × ${faces.length} rostos (os extremos do crânio, da testa, das orelhas, do rosto, a criança, o velho, trinta genomas), ${tested} raios: ${worse ? report.join(' · ') : 'nenhum deixa passar mais que a cabeça sem forma'}`);
  }
  // ------------------------------ r5 the cloth ------------------------------
  if (want('r5')) {
    // (a point of the body out past the cloth that goes round it, along the ray from the hips' line: counted for the body of no
    // shape, and for the fat, the pregnant and the strong one — the cloth carries the shape and its girth, never letting more through)
    const NA = 72, NB = 60; const cyl = (x, y, z) => [(Math.atan2(x, z) / (2 * Math.PI) + 0.5) * NA, (y - 0.4) / 1.1 * NB];
    const report = []; let worse = 0, tested = 0;
    for (const [body, fem] of [['corpoM', false], ['corpoF', true]]) for (const name of ['saiaC', 'saiaL', 'toga', 'bata']) {
      const piece = MESH[name]; if (!piece) continue; let base = -1;
      for (const [fname, w, girth] of [['nenhum', w0(), 1], ['gordo', Object.assign(w0(), { [X.gordo]: 1.2 }), 1.144], ['grávida', Object.assign(w0(), { [X.gestante]: 1 }), 1.25], ['forte', Object.assign(w0(), { [X.musculo]: 1.1, [X.ombros]: 0.9 }), 1.055]]) {
        posed({ w, girth, look: { fem }, st: process.env.ST }); const S = bentM(body, w, girth); const Bm = MESH[body];
        const H = binned(piece, bentM(name, w, girth), cyl, NA, NB);
        // (the points of the trunk under a blouse or a toga, of the hips and the thighs under a skirt — by the bone that carries them:
        // the arms hang outside a blouse, and are no part of it)
        const own = new Set((name === 'bata' || name === 'toga' ? ['pel', 'spine', 'chest'] : ['pel', 'spine', 'thL', 'thR', 'hpHL', 'hpHR']).map(b => G.BODYMESH.bones.indexOf(b)));
        const y0 = name === 'bata' ? 0.95 : 0.6, y1 = name === 'bata' ? 1.3 : 0.98; let out = 0, n = 0;
        for (let i = 0; i < Bm.n; i++) { const x = S[i * 3], y = S[i * 3 + 1], z = S[i * 3 + 2]; if (Bm.zone[i] !== 0 || !own.has(Bm.bi[i * 4]) || y < y0 || y > y1) continue; const l = Math.hypot(x, z); if (l < 0.02) continue;
          const [t] = hitB(H, [0, y, 0], [x / l, 0, z / l], cyl(x, y, z)); tested++; n++; if (t < 0.6 && l > t + 0.008) { out++; if (process.env.DBG && fname !== 'nenhum') console.log('out', name, body, fname, Bm.pos[i * 3].toFixed(3), Bm.pos[i * 3 + 1].toFixed(3), Bm.pos[i * 3 + 2].toFixed(3), 'body r', l.toFixed(3), 'cloth r', t.toFixed(3)); } }
        if (base < 0) base = out; else if (out > base + Math.max(4, n * 0.01)) { worse++; report.push(`${name} em ${body} ${fname}: ${out} de ${n} pontos para fora (sem forma ${base})`); }
      }
    }
    ok('r5 o pano sem o corpo passar (gordo, grávida, forte)', worse === 0, `${tested} raios: ${worse ? report.slice(0, 6).join(' · ') : 'saiaC, saiaL, toga e bata nos dois corpos: nenhuma forma deixa passar mais que o corpo sem forma'}`);
  }
  // ------------------------------ r6 the stumps ------------------------------
  if (want('r6')) {
    const res = []; let good = true;
    for (const [n, side, leg] of [['cotoBracoE', 1, false], ['cotoBracoD', -1, false], ['cotoPernaE', 1, true], ['cotoPernaD', -1, true]]) {
      const w = Object.assign(w0(), { [X[n]]: 1 }); const d = B3.morphOf('corpoM', w), m = MESH.corpoM; let far = 0, moved = 0, worst = 0;
      for (let i = 0; i < m.n; i++) { const x = m.pos[i * 3] + d[i * 3], y = m.pos[i * 3 + 1] + d[i * 3 + 1], z = m.pos[i * 3 + 2] + d[i * 3 + 2]; if (Math.hypot(d[i * 3], d[i * 3 + 1], d[i * 3 + 2]) > 1e-4) moved++;
        if (leg) { if (Math.sign(m.pos[i * 3]) === side && m.pos[i * 3 + 1] < 0.4) { worst = Math.max(worst, 0.55 - y); if (y < 0.48) far++; } }
        else { const t = (x * side - 0.235) * Math.sin(0.6) + (1.44 - y) * Math.cos(0.6); if (Math.sign(m.pos[i * 3]) === side && Math.abs(m.pos[i * 3]) > 0.3) { worst = Math.max(worst, t); if (t > 0.3) far++; } } }
      if (far || moved < 50) good = false; res.push(`${n}: ${moved} pontos recolhidos, ${far} além do coto`);
    }
    ok('r6 o coto fecha', good, res.join(' · '));
  }
}
// ------------------------------ r7 the shape of a person ------------------------------
if (want('r7')) {
  const Ge = G.Genoma; const g = Ge.founder(77, 'grego', 0, 9); const v = { id: 77, age: 30, g: 'm', genoma: g, hunger: 20, hp: 100, role: 'agricultor' };
  const a = Fe.of(v), b = Fe.of(Object.assign({}, v)); const same = a === b || (a.skin === b.skin && a.alt === b.alt && a.w.every((x, i) => x === b.w[i]));
  const P = Ge.pheno(g); const skinOk = a.skin === Ge.skinHex(P[0], P[1]);
  let altOk = true; for (let k = 0; k < 400; k++) { const o = Fe.of({ id: 5000 + k, age: 30, g: 'm', genoma: Ge.founder(5000 + k, 'nordico', 0, 3) }); if (!(Math.abs(o.alt - 1) <= 0.0801)) altOk = false; }
  const kid = Fe.of({ id: 77, age: 2, g: 'm', genoma: g }), grown = Fe.of({ id: 77, age: 25, g: 'm', genoma: g });
  const firm = Math.abs(kid.w[X.mandibula]) <= Math.abs(grown.w[X.mandibula]) + 1e-6 && kid.w[X.infancia] > 0.8 && grown.w[X.infancia] < 0.01;
  const mid = 'g'.repeat(Ge.LEN); // (a genome at the middle of every gene: what the life does shows whole)
  const starving = Fe.of({ id: 78, age: 30, g: 'm', genoma: mid, hunger: 100, hp: 50 }), fed = Fe.of({ id: 79, age: 30, g: 'm', genoma: mid, hunger: 20, hp: 100 });
  const smith = Fe.of({ id: 80, age: 30, g: 'm', genoma: mid, role: 'ferreiro' }), scribe = Fe.of({ id: 81, age: 30, g: 'm', genoma: mid, role: 'escriba' });
  const thin = starving.w[X.magro] > fed.w[X.magro] + 0.2;
  const strong = smith.w[X.musculo] > scribe.w[X.musculo];
  const rich = Fe.of({ id: 82, age: 30, g: 'm', genoma: mid, home: 1, elite: { dono: 82 } }), poor = Fe.of({ id: 83, age: 30, g: 'm', genoma: mid });
  const noClass = rich.w[X.gordo] === poor.w[X.gordo];
  ok('r7 a feição de uma pessoa', same && skinOk && altOk && firm && thin && strong && noClass,
    `a mesma pessoa duas vezes: ${same ? 'a mesma' : 'OUTRA'} · a pele do genoma: ${skinOk ? 'sim' : 'NÃO'} · a altura de 400 nórdicos nos ±8%: ${altOk ? 'sim' : 'NÃO'} · o rosto da criança firmando no seu (mandíbula ${kid.w[X.mandibula].toFixed(2)} → ${grown.w[X.mandibula].toFixed(2)}, infância ${kid.w[X.infancia].toFixed(2)} → ${grown.w[X.infancia].toFixed(2)}) · quem passa fome mais magro (${starving.w[X.magro].toFixed(2)} contra ${fed.w[X.magro].toFixed(2)}) · o ferreiro mais forte que o escriba (${smith.w[X.musculo].toFixed(2)} contra ${scribe.w[X.musculo].toFixed(2)}) · a casa rica não engorda (${noClass ? 'igual' : 'DIFERENTE'})`);
}
console.log(fails.length ? `FALHOU: ${fails.join(', ')}` : 'TUDO PASSOU');
process.exit(fails.length ? 1 : 0);
