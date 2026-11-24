// itens-arte: the art of the things (G.ItemArt, js/itemarte.js + js/itemforma.js + js/itemicons.js) proven in Node, without a
// browser (a few seconds): every key of the catalog (G.Itens: each kind in each of its materials) has its shape at the three
// levels within the budget, its numbers finite, its normals of length one, its colours and its shine in 0…1; its frame is the
// one of D-337 (the grip inside the handle at the origin, the working end toward +Y, its front toward +Z; what hangs, toward +Z;
// the shield's face toward +Z; the bow's string behind the grip; the arrow's nock at the origin); the other hand's place is on the
// thing (inside it); the helmet and the cuirass clear the head and the torso of both bodies (js/bodymesh.js); what is stowed on
// the back or at the belt stays out of the body; every key has its picture, of the shape it has now; the material's patch finds
// its places in three.js, with the game's light on it; the same key is the same shape twice.
//   node qa/visual/itens-arte.js            → PASSOU / FALHOU, a line a proof, and the cost (sizes, triangles)
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.resolve(__dirname, '..', '..');
// (part 10 in a process of its own, with the real game loaded: the inventory is a module of the world now — 20c — and does not run
// in this file's bare numbers; T-1422)
if (process.argv[2] === 'verificador') { verifier(); return; }
global.window = global; global.G = {};
global.atob = s => Buffer.from(s, 'base64').toString('binary');
const run = f => vm.runInThisContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), { filename: f });
run('js/lib/three.min.js'); global.THREE = window.THREE;
for (const f of ['js/itens.js', 'js/itemforma.js', 'js/itemarte.js', 'js/itemicons.js', 'js/bodymesh.js']) run(f);
const IA = G.ItemArt, It = G.Itens, F = G.ItemForma;
let nf = 0; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | itens-arte ${name} | ${info}`); if (!c) nf++; };
const KEYS = IA.keys(); const KINDS = Object.keys(It.KINDS);
const v3 = (a, i) => [a[i * 3], a[i * 3 + 1], a[i * 3 + 2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
// (a part's triangles, and two questions about a point: is it inside that closed part (a ray's crossings), how far from it)
const tris = (b, names) => { const o = []; for (const p of b.parts) if (!names || names.includes(p.name)) for (let i = p.start; i < p.start + p.count; i += 3) o.push([v3(b.pos, b.idx[i]), v3(b.pos, b.idx[i + 1]), v3(b.pos, b.idx[i + 2])]); return o; };
function inside(T, p) { const d = [0.3172, 0.8361, 0.4475]; let n = 0; for (const [a, b, c] of T) { const e1 = sub(b, a), e2 = sub(c, a), h = crs(d, e2), det = dot(e1, h); if (Math.abs(det) < 1e-14) continue; const f = 1 / det, s = sub(p, a), u = f * dot(s, h); if (u < 0 || u > 1) continue; const q = crs(s, e1), v = f * dot(d, q); if (v < 0 || u + v > 1) continue; if (f * dot(e2, q) > 0) n++; } return n % 2 === 1; }
function dist(T, p) { let best = 1e9; for (const [a, b, c] of T) { const ab = sub(b, a), ac = sub(c, a), ap = sub(p, a); const d1 = dot(ab, ap), d2 = dot(ac, ap); const n = crs(ab, ac), nl = Math.hypot(...n) || 1; let dd; const pd = Math.abs(dot(ap, n)) / nl;
  const bb = dot(n, n) || 1; const w1 = dot(crs(sub(p, a), ac), n) / bb, w2 = dot(crs(ab, sub(p, a)), n) / bb; if (w1 >= 0 && w2 >= 0 && w1 + w2 <= 1) dd = pd; else { dd = 1e9; for (const [x, y] of [[a, b], [b, c], [c, a]]) { const e = sub(y, x), t = Math.max(0, Math.min(1, dot(sub(p, x), e) / (dot(e, e) || 1))); const q = [x[0] + e[0] * t, x[1] + e[1] * t, x[2] + e[2] * t]; dd = Math.min(dd, Math.hypot(...sub(p, q))); } } void d1; void d2; best = Math.min(best, dd); } return best; }
const centroid = T => { const c = [0, 0, 0]; let n = 0; for (const t of T) for (const p of t) { c[0] += p[0]; c[1] += p[1]; c[2] += p[2]; n++; } return n ? c.map(x => x / n) : null; };

// ---------------- 1. every key, three levels, within the budget, sound numbers ----------------
{ const bad = []; let n = 0;
  for (const k of KEYS) { const bud = IA.budgetOf(k); let prev = 1e9;
    for (let l = 0; l < 3; l++) { const g = IA.geo(k, l); n++;
      if (!g || !g.isBufferGeometry) { bad.push(`${k} nível ${l}: sem forma`); continue; }
      for (const a of ['position', 'normal', 'color', 'shine']) if (!g.attributes[a]) bad.push(`${k} nível ${l}: sem ${a}`);
      const t = g.index.count / 3; if (t > bud[l]) bad.push(`${k} nível ${l}: ${t} triângulos (orçamento ${bud[l]})`); if (t >= prev) bad.push(`${k} nível ${l}: ${t} triângulos, não menos que o nível de antes (${prev})`); prev = t;
      const P = g.attributes.position.array, N = g.attributes.normal.array, C = g.attributes.color.array, S = g.attributes.shine.array, I = g.index.array;
      if ([P, N, C, S].some(a => a.some(x => !Number.isFinite(x)))) bad.push(`${k} nível ${l}: números que não são números`);
      let un = 0; for (let i = 0; i < N.length; i += 3) if (Math.abs(Math.hypot(N[i], N[i + 1], N[i + 2]) - 1) > 0.01) un++; if (un) bad.push(`${k} nível ${l}: ${un} normais sem comprimento 1`);
      if (C.some(x => x < 0 || x > 1) || S.some(x => x < 0 || x > 1)) bad.push(`${k} nível ${l}: cor ou brilho fora de 0…1`);
      if (I.some(x => x >= P.length / 3)) bad.push(`${k} nível ${l}: índice fora dos pontos`);
      // (no triangle of no area: a degenerate one is a hole in the shading and a waste)
      let deg = 0; for (let i = 0; i < I.length; i += 3) { const a = v3(P, I[i]), b = v3(P, I[i + 1]), c = v3(P, I[i + 2]); if (Math.hypot(...crs(sub(b, a), sub(c, a))) < 1e-12) deg++; } if (deg > t * 0.02) bad.push(`${k} nível ${l}: ${deg} triângulos sem área`);
    } }
  ok('formas', !bad.length, bad.length ? bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` (+${bad.length - 8})` : '') : `${KEYS.length} chaves × 3 níveis = ${n} formas, dentro do orçamento (mão ${IA.BUDGET.mao.join('/')}, grande ${IA.BUDGET.grande.join('/')}, vestir ${IA.BUDGET.vestir.join('/')}), números finitos, normais unitárias`); }

// ---------------- 2. the keys the catalog reads: the plain one is its first material, the rest none ----------------
{ const bad = [];
  for (const kind of KINDS) { const g = IA.geo(kind, 0), g2 = IA.geo(kind + '.' + It.KINDS[kind].mats[0], 0); if (!g || g !== g2) bad.push(`${kind}: a chave simples não é a do primeiro material`); if (IA.icon(kind) !== IA.icon(kind + '.' + It.KINDS[kind].mats[0])) bad.push(`${kind}: a figura da chave simples não é a do primeiro material`); }
  for (const k of ['wood', 'food', 'pedra', 'nada', '', null, 'machado.ouro.x']) { const g = IA.geo(k, 0); if (g && k !== 'machado.ouro.x') bad.push(`${k}: tem forma, e não é coisa do catálogo`); }
  if (IA.icon('wood') || IA.icon('nada')) bad.push('um bem ou uma chave desconhecida tem figura');
  if (IA.grip('nada').off !== null || IA.stow('nada', 'costas') !== null || IA.marks('nada') !== null) bad.push('uma chave desconhecida tem pega, encaixe ou pontos');
  ok('chaves', !bad.length, bad.length ? bad.join('; ') : `as ${KINDS.length} chaves simples dão a forma e a figura do primeiro material; um bem (wood, food) e uma chave desconhecida dão null`); }

// ---------------- 3. the frame (D-337, D-386, D-387) ----------------
const HANG = new Set(['cesto', 'balde', 'funda']), WORN = new Set(['elmo', 'couraca']);
// (22c, D-612: the things of daily life, each held its own way — the cup by its handle, its body to the palm's side (+X) and its
// mouth up; the ball in the palm, toward +X; the bonds round the two wrists behind the palms (−Z), the other palm a hand from its ring)
const DAILY = {
  caneca: (k, b, info, cabo, head, hc) => { const o = []; if (!cabo.length || (!inside(cabo, [0, 0, 0]) && dist(cabo, [0, 0, 0]) > 0.004)) o.push(`${k}: a mão não está na asa`); if (!(hc && hc[0] > 0.03)) o.push(`${k}: o corpo da caneca não está do lado da palma (+X)`); if (!(b.marks.boca && hc && b.marks.boca[1] > hc[1] + 0.03)) o.push(`${k}: a boca da caneca não está para cima (+Y)`); return o; },
  // (P7, D-768: the plate by the lug of its rim, the plate to the palm's side and lying flat, the meal on its face)
  prato: (k, b, info, cabo, head, hc) => { const o = []; if (!cabo.length || (!inside(cabo, [0, 0, 0]) && dist(cabo, [0, 0, 0]) > 0.004)) o.push(`${k}: a mão não está na aba do prato`); if (!(hc && hc[0] > 0.06)) o.push(`${k}: o prato não está do lado da palma (+X)`); const hy = info.hi[1] - info.lo[1], hx = info.hi[0] - info.lo[0]; if (!(hy < 0.07 && hx > 0.15)) o.push(`${k}: o prato não está deitado (${(hy * 100).toFixed(1)} cm de alto, ${(hx * 100).toFixed(1)} de largo)`); if (!(b.marks.boca && hc && b.marks.boca[1] > hc[1] + 0.01)) o.push(`${k}: a comida não está por cima do prato (+Y)`); return o; },
  // (P7, D-805: the knucklebones in the closed fist, at the palm's side; the rag a wad in the hand — the wool's fold hanging toward +Z, the
  // straw's twist up through it)
  ossinhos: (k, b, info, cabo, head, hc) => { const o = []; const dd = dist(head, [0, 0, 0]); if (dd > 0.02) o.push(`${k}: os ossinhos longe da palma (a ${(dd * 100).toFixed(1)} cm)`); if (!(hc && hc[0] > 0.01 && hc[0] < 0.05)) o.push(`${k}: os ossinhos não estão na mão fechada, do lado da palma (+X)`); const big = Math.max(info.hi[0] - info.lo[0], info.hi[1] - info.lo[1], info.hi[2] - info.lo[2]); if (big > 0.07) o.push(`${k}: ossinhos grandes demais (${(big * 100).toFixed(1)} cm)`); return o; },
  pano: (k, b, info, cabo, head, hc) => { const o = []; const dd = dist(head, [0, 0, 0]); if (!inside(head, [0, 0, 0]) && dd > 0.012) o.push(`${k}: a palma não está no pano (a ${(dd * 100).toFixed(1)} cm)`); if (!(hc && hc[0] > 0.005)) o.push(`${k}: o pano não está do lado da palma (+X)`); return o; },
  bola: (k, b, info, cabo, head, hc) => { const o = []; const dd = dist(head, [0, 0, 0]); if (!inside(head, [0, 0, 0]) && dd > 0.004) o.push(`${k}: a palma não está na bola (a ${(dd * 100).toFixed(1)} cm)`); else if (inside(head, [0, 0, 0]) && dd > 0.02) o.push(`${k}: a palma dentro da bola (${(dd * 100).toFixed(1)} cm)`); if (!(hc && hc[0] > 0.03)) o.push(`${k}: a bola não está do lado da palma (+X)`); return o; },
  grilhoes: (k, b, info, cabo, head, hc) => { const o = []; const C = F.cuffs, g = IA.grip(k); if (!C) return [`${k}: sem os pulsos (F.cuffs)`];
    for (const [nm, w] of [['direita', C.WR], ['esquerda', C.WL]]) { const near = head.filter(t => t.some(p => Math.hypot(p[0] - w[0], p[1] - w[1]) < 0.06 && Math.abs(p[2] - w[2]) < 0.03)); if (near.length < 8) o.push(`${k}: nada em volta do pulso ${nm}`); else { const dd = dist(near, w); if (dd < 0.025) o.push(`${k}: a argola ${nm} aperta o pulso (${(dd * 100).toFixed(1)} cm)`); } }
    const dR = Math.hypot(C.WR[0], C.WR[1], C.WR[2]); if (!(dR > 0.07 && dR < 0.12 && C.WR[2] < -0.06)) o.push(`${k}: a palma direita não está a um palmo da argola dela, para a frente (${(dR * 100).toFixed(1)} cm)`);
    if (!g.off) o.push(`${k}: de duas mãos sem o lugar da outra mão`); else { const dL = Math.hypot(g.off[0] - C.WL[0], g.off[1] - C.WL[1], g.off[2] - C.WL[2]); if (!(dL > 0.07 && dL < 0.12 && g.off[2] > C.WL[2] + 0.06)) o.push(`${k}: a outra palma não está a um palmo da argola dela (${(dL * 100).toFixed(1)} cm)`); }
    return o; },
};
{ const bad = []; const lines = [];
  for (const k of KEYS) { const kind = k.split('.')[0]; const d = It.def(k); const b = IA.raw(k, 0); const info = IA.info(k);
    const cabo = tris(b, ['cabo']), head = tris(b, ['cabeca']); const hc = centroid(head);
    if (DAILY[kind]) { bad.push(...DAILY[kind](k, b, info, cabo, kind === 'grilhoes' ? tris(b, ['cabeca', 'outra']) : head, hc)); lines.push(kind); continue; }
    if (!WORN.has(kind)) {
      // (the main hand closes on the thing at the origin: inside its handle, or on it)
      const o = [0, 0, 0]; if (!cabo.length) bad.push(`${k}: sem cabo`); else if (!inside(cabo, o) && dist(cabo, o) > 0.004) bad.push(`${k}: a origem (a mão) não está no cabo (a ${(dist(cabo, o) * 100).toFixed(1)} cm dele)`);
      if (!hc && kind !== 'arco') { bad.push(`${k}: sem a parte que trabalha (cabeca)`); continue; }
      if (HANG.has(kind)) { if (!(hc[2] > 0.15)) bad.push(`${k}: o que pende não pende para +Z (o centro em z ${hc[2].toFixed(2)})`); }
      else if (kind === 'escudo') { if (!(hc[2] > 0.0 && b.marks.centro[2] > 0.05)) bad.push(`${k}: a face do escudo não olha para +Z`); if (Math.abs(info.hi[1] + info.lo[1]) > 0.02) bad.push(`${k}: o escudo não está centrado no punho`); }
      else if (kind === 'arco') { const c = centroid(tris(b, ['corda'])); if (!(c && c[2] < -0.1)) bad.push(`${k}: a corda não está atrás do punho (−Z)`); if (!(info.hi[1] > 0.6 && info.lo[1] < -0.6)) bad.push(`${k}: os braços do arco não vão para ±Y`); }
      else if (!(hc[1] > 0.08)) bad.push(`${k}: a parte que trabalha não está para +Y (o centro em y ${hc[1].toFixed(2)})`);
      // (the front: the edge of an axe, a pick, a hoe, a hammer's face, the sickle's crescent toward +Z; a sword's and a
      // knife's edges along ±Z — the blade wider in Z than in X)
      if (['machado', 'picareta', 'enxada', 'martelo', 'foice'].includes(kind)) { let zx = -1; for (const t of head) for (const p of t) zx = Math.max(zx, p[2]); if (!(zx > 0.05)) bad.push(`${k}: a frente da cabeça não vai para +Z (z máx ${zx.toFixed(2)})`); }
      if (['espada', 'faca', 'lanca'].includes(kind)) { let wx = 0, wz = 0; for (const t of head) for (const p of t) if (p[1] > (b.marks.centro[1] - 0.03) && p[1] < b.marks.centro[1] + 0.03) { wx = Math.max(wx, Math.abs(p[0])); wz = Math.max(wz, Math.abs(p[2])); } if (!(wz > wx)) bad.push(`${k}: os fios não estão em ±Z (largura em X ${wx.toFixed(3)}, em Z ${wz.toFixed(3)})`); }
      if (['pa', 'remo'].includes(kind)) { let wx = 0, wz = 0; for (const t of head) for (const p of t) { wx = Math.max(wx, Math.abs(p[0])); wz = Math.max(wz, Math.abs(p[2])); } if (!(wx > 2 * wz)) bad.push(`${k}: a face da lâmina não olha para ±Z`); }
      if (kind === 'flecha' && !(info.lo[1] > -0.03 && b.marks.ponta[1] > 0.65)) bad.push(`${k}: a flecha não vai do entalhe (a origem) à ponta em +Y`);
      // (the other hand: on the thing — inside its handle, its string, the bundle — for a thing of two hands; none for one)
      const g = IA.grip(k); const two = d.maos === 2 && d.pega !== null;
      if (two) { if (!g.off) bad.push(`${k}: de duas mãos sem o lugar da outra mão`); else { const T = tris(b, kind === 'arco' ? ['corda'] : kind === 'rede' ? ['cabeca'] : ['cabo']); const din = inside(T, g.off), dd = dist(T, g.off); if (!din && dd > (kind === 'arco' ? 0.0005 : 0.004)) bad.push(`${k}: a outra mão (${g.off.map(x => x.toFixed(2))}) fora da coisa (a ${(dd * 100).toFixed(1)} cm)`); else lines.push(kind); } }
      else if (g.off) bad.push(`${k}: de uma mão com lugar para a outra`);
    }
  }
  ok('quadro', !bad.length, bad.length ? bad.slice(0, 10).join('; ') : `o punho na origem, dentro do cabo, em todas; a parte que trabalha para +Y, a frente para +Z; o que pende para +Z; a corda do arco atrás; a outra mão dentro da coisa em ${[...new Set(lines)].join(', ')}`); }

// ---------------- 4. the worn things fit the bodies of both shapes (D-387) ----------------
const BM = G.BODYMESH; const bb = s => new Uint8Array(Buffer.from(s, 'base64'));
const dec = m => { const q = new Uint16Array(bb(m.pos).buffer.slice(0)); const pos = new Float32Array(m.n * 3); for (let i = 0; i < m.n; i++) for (let k = 0; k < 3; k++) pos[i * 3 + k] = m.lo[k] + q[i * 3 + k] * m.sc[k]; return { n: m.n, pos, bi: bb(m.bi), bw: bb(m.bw), zone: bb(m.zone) }; };
const BODIES = ['corpoM', 'corpoF'].map(n => dec(BM.meshes[n])); const B = BM.bones; const iHead = B.indexOf('head'), iChest = B.indexOf('chest');
const bindY = n => BM.bind[n][1];
{ const bad = []; const say = [];
  // (the head: its vertices from the head bone, round the helmet's centre — in each direction the helmet is farther out)
  const HC = F.head.HC; const bin = (d) => { const th = Math.atan2(d[0], d[2]), ph = Math.acos(Math.max(-1, Math.min(1, d[1]))); return Math.floor((th + Math.PI) / 0.12) * 100 + Math.floor(ph / 0.12); };
  for (const mat of It.KINDS.elmo.mats) { const k = 'elmo.' + mat; const b = IA.raw(k, 0); const hmin = new Map();
    for (let i = 0; i < b.pos.length / 3; i++) { const p = v3(b.pos, i); const d = sub(p, HC); const r = Math.hypot(...d); const key = bin(d.map(x => x / r)); hmin.set(key, Math.min(hmin.get(key) || 9, r)); }
    let worst = 9, n = 0; for (const body of BODIES) for (let i = 0; i < body.n; i++) { if (body.bi[i * 4] !== iHead || body.zone[i] !== 0) continue; const p = [body.pos[i * 3], body.pos[i * 3 + 1] - bindY('head'), body.pos[i * 3 + 2]]; if (p[1] < 0.06) continue; const d = sub(p, HC); const r = Math.hypot(...d); const hm = hmin.get(bin(d.map(x => x / r))); if (hm === undefined) continue; n++; worst = Math.min(worst, hm - r); }
    if (worst < 0.004) bad.push(`${k}: a cabeça a ${(worst * 100).toFixed(1)} cm por dentro do elmo`); say.push(`${k} folga ${(worst * 100).toFixed(1)} cm (${n} pontos)`); }
  // (the torso: the chest, the spine and the pelvis' skin round its axis, in bands of height and angle — the cuirass outside)
  for (const mat of It.KINDS.couraca.mats) { const k = 'couraca.' + mat; const b = IA.raw(k, 0); const cmin = new Map(); const key = (y, a) => Math.floor(y / 0.02) * 1000 + Math.floor((a + Math.PI) / 0.14);
    for (let i = 0; i < b.pos.length / 3; i++) { const p = v3(b.pos, i); const r = Math.hypot(p[0], p[2]); const kk = key(p[1], Math.atan2(p[0], p[2])); cmin.set(kk, Math.min(cmin.get(kk) || 9, r)); }
    let worst = 9, n = 0; for (const body of BODIES) for (let i = 0; i < body.n; i++) { if (body.bi[i * 4] > iChest || body.zone[i] !== 0) continue; const p = [body.pos[i * 3], body.pos[i * 3 + 1] - bindY('chest'), body.pos[i * 3 + 2]]; if (p[1] < -0.03 || p[1] > 0.5) continue; const r = Math.hypot(p[0], p[2]); const cm = cmin.get(key(p[1], Math.atan2(p[0], p[2]))); if (cm === undefined) continue; n++; worst = Math.min(worst, cm - r); }
    if (worst < 0.004) bad.push(`${k}: o tronco a ${(worst * 100).toFixed(1)} cm por dentro da couraça`); say.push(`${k} folga ${(worst * 100).toFixed(1)} cm (${n} pontos)`); }
  ok('vestir', !bad.length, bad.length ? bad.join('; ') : say.join('; ')); }

// ---------------- 5. stowed: a place on the back and at the belt where the catalog allows, out of the body ----------------
{ const bad = []; let n = 0; const torso = new Map(); const tkey = (y, a) => Math.floor(y / 0.03) * 1000 + Math.floor((a + Math.PI) / 0.2);
  for (const body of BODIES) for (let i = 0; i < body.n; i++) { if (body.bi[i * 4] > iChest || body.zone[i] !== 0) continue; const p = [body.pos[i * 3], body.pos[i * 3 + 1], body.pos[i * 3 + 2]]; const kk = tkey(p[1], Math.atan2(p[0], p[2])); torso.set(kk, Math.max(torso.get(kk) || 0, Math.hypot(p[0], p[2]))); }
  for (const k of KEYS) for (const place of ['costas', 'cinto']) { const s = IA.stow(k, place); const fits = It.fits(k, place);
    if (!fits) { if (s) bad.push(`${k}: tem encaixe em ${place}, e o catálogo não o deixa lá`); continue; }
    if (!s) { bad.push(`${k}: sem encaixe em ${place}`); continue; } n++;
    const nums = [...s.at, ...s.y, ...s.z, ...s.q]; if (nums.some(x => !Number.isFinite(x)) || Math.abs(Math.hypot(...s.y) - 1) > 1e-6 || Math.abs(Math.hypot(...s.z) - 1) > 1e-6 || Math.abs(dot(s.y, s.z)) > 1e-6 || Math.abs(Math.hypot(...s.q) - 1) > 1e-6) { bad.push(`${k} em ${place}: os eixos não são unitários e perpendiculares`); continue; }
    if (!['chest', 'pel'].includes(s.bone)) { bad.push(`${k} em ${place}: o osso ${s.bone}`); continue; }
    // (the thing's mid shape put there, in the body's bind space: how much of it is inside the torso)
    const b = IA.raw(k, 1); const X = crs(s.y, s.z); const by = bindY(s.bone); let inn = 0; const nv = b.pos.length / 3;
    for (let i = 0; i < nv; i++) { const p = v3(b.pos, i); const w = [s.at[0] + X[0] * p[0] + s.y[0] * p[1] + s.z[0] * p[2], by + s.at[1] + X[1] * p[0] + s.y[1] * p[1] + s.z[1] * p[2], s.at[2] + X[2] * p[0] + s.y[2] * p[1] + s.z[2] * p[2]];
      const r = torso.get(tkey(w[1], Math.atan2(w[0], w[2]))); if (r && Math.hypot(w[0], w[2]) < r - 0.01) inn++; }
    if (inn > nv * 0.03) bad.push(`${k} em ${place}: ${inn} de ${nv} pontos dentro do tronco`); }
  ok('guardar', !bad.length, bad.length ? bad.slice(0, 8).join('; ') : `${n} encaixes (costas no peito, cinto na bacia), eixos unitários e perpendiculares, nada dentro do tronco`); }

// ---------------- 6. the pictures: every key, WebP 128 × 128 with its ground transparent, of the shape it has now ----------------
{ const bad = []; let kb = 0; const D = G.ITEMICONS || {};
  for (const k of KEYS) { const u = IA.icon(k); if (!u) { bad.push(`${k}: sem figura`); continue; }
    const m = /^data:image\/webp;base64,(.+)$/.exec(u); if (!m) { bad.push(`${k}: a figura não é um WebP embutido`); continue; } const buf = Buffer.from(m[1], 'base64'); kb += buf.length / 1024;
    if (buf.slice(0, 4).toString() !== 'RIFF' || buf.slice(8, 12).toString() !== 'WEBP') { bad.push(`${k}: a figura não é WebP`); continue; }
    const t = buf.slice(12, 16).toString(); let w = 0, h = 0, alpha = false;
    if (t === 'VP8X') { w = 1 + buf.readUIntLE(24, 3); h = 1 + buf.readUIntLE(27, 3); alpha = !!(buf[20] & 0x10); } else if (t === 'VP8L') { const v = buf.readUInt32LE(21); w = 1 + (v & 0x3fff); h = 1 + ((v >> 14) & 0x3fff); alpha = !!((v >> 28) & 1); }
    if (w !== IA.ICON_SIZE || h !== IA.ICON_SIZE) bad.push(`${k}: a figura tem ${w} × ${h}`); if (!alpha) bad.push(`${k}: a figura não tem fundo transparente`);
    if (!D.sig || D.sig[k] !== IA.sig(k)) bad.push(`${k}: a figura é de uma forma de antes (bash qa/navegador.sh node qa/visual/itens-figuras.js PASTA icones)`); }
  for (const k in (D.img || {})) if (!KEYS.includes(k)) bad.push(`${k}: figura de uma chave que o catálogo não tem`);
  ok('figuras', !bad.length, bad.length ? bad.slice(0, 8).join('; ') + (bad.length > 8 ? ` (+${bad.length - 8})` : '') : `${KEYS.length} figuras WebP 128 × 128 com transparência, cada uma da forma de agora (${kb.toFixed(0)} KB)`); }

// ---------------- 7. the material: its patch finds its six places, with the game's light under it ----------------
{ const bad = []; const sh = () => ({ vertexShader: THREE.ShaderLib.lambert.vertexShader, fragmentShader: THREE.ShaderLib.lambert.fragmentShader });
  const n0 = IA.patch(sh(), THREE); if (n0 !== 6) bad.push(`sem a luz do jogo: ${n0} de 6 lugares`);
  // (the game's soft light: the patch the sky's file makes now — js/ceu3d.js, 21d —, or the realm's of before; T-1620)
  const lightOf = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8').match(/rep\('lights_lambert_pars_fragment', ('[^']*'), (`[^`]*`)\);/); } catch (e) { return null; } };
  const tm = lightOf('js/ceu3d.js') || lightOf('js/realm3d.js');
  if (!tm) bad.push('o remendo da luz do ceu3d.js (ou do realm3d.js) não foi achado'); else { const SC = THREE.ShaderChunk; const old = SC.lights_lambert_pars_fragment; SC.lights_lambert_pars_fragment = old.replace(eval(tm[1]), eval(tm[2])); const s = sh(); const n1 = IA.patch(s, THREE); if (n1 !== 6) bad.push(`com a luz do jogo: ${n1} de 6 lugares`); if (!/iaSpec/.test(s.fragmentShader) || !/smoothstep\( -0\.06, 0\.4, nl \)/.test(s.fragmentShader)) bad.push('o brilho e a luz macia do jogo não ficaram juntos'); SC.lights_lambert_pars_fragment = old; }
  const m = IA.material(THREE, { key: 'prova' }); if (!m.vertexColors || typeof m.onBeforeCompile !== 'function') bad.push('o material não lê as cores dos pontos');
  ok('material', !bad.length, bad.length ? bad.join('; ') : 'o brilho (metal, polido, tinta) acha os seis lugares do three.js r' + THREE.REVISION + ', com e sem a luz macia do realm3d.js'); }

// ---------------- 8. the same key is the same shape: built again in a fresh world of numbers ----------------
{ const ctx = { window: {}, G: {}, Math, Float32Array, Uint16Array, Uint32Array, Float64Array, Object, Array, Number, Set, Map, String, parseInt, Infinity }; ctx.window = ctx; ctx.window.G = ctx.G; vm.createContext(ctx);
  for (const f of ['js/itens.js', 'js/itemforma.js']) vm.runInContext(fs.readFileSync(path.join(ROOT, f), 'utf8'), ctx, { filename: f });
  const bad = []; for (const k of KEYS) { const [kind, mat] = k.split('.'); for (let l = 0; l < 3; l++) { const a = IA.raw(k, l), b = ctx.G.ItemForma.build(kind, mat, l); if (a.pos.length !== b.pos.length || a.pos.some((x, i) => x !== b.pos[i]) || a.col.some((x, i) => x !== b.col[i])) { bad.push(`${k} nível ${l}`); break; } } }
  ok('sempre-a-mesma', !bad.length, bad.length ? 'diferentes: ' + bad.join(', ') : `as ${KEYS.length} chaves feitas de novo num mundo à parte dão os mesmos números, ponto a ponto`); }

// ---------------- 9. the module's own proof ----------------
{ const c = IA.check(); ok('check', !c.length, c.length ? c.slice(0, 6).join('; ') : 'G.ItemArt.check() vazio'); }

// ---------------- 10. the verifier's rule (qa/itens-arte-inv.js) on a small world: quiet, then caught by each sabotage ----------------
// (in its own process, with the game's own modules — qa/nodemundo.js —: the real G.Inv.held of those people, the real catalog)
{ let out = ''; try { out = require('child_process').execFileSync(process.execPath, [__filename, 'verificador'], { cwd: ROOT, maxBuffer: 1 << 24 }).toString(); } catch (e) { out = String(e.stdout || '') + String(e.stderr || e.message); }
  const line = out.split('\n').find(l => / \| itens-arte verificador \| /.test(l));
  if (line) { console.log(line); if (!line.startsWith('PASSOU')) nf++; } else ok('verificador', false, 'o processo da prova não respondeu: ' + out.slice(-400).replace(/\s+/g, ' ')); }

// ---------------- the cost ----------------
{ const sz = f => fs.statSync(path.join(ROOT, f)).size / 1024; const T = [[], [], []]; for (const k of KEYS) for (let l = 0; l < 3; l++) T[l].push(IA.raw(k, l).idx.length / 3);
  const st = a => `${Math.min(...a)}–${Math.max(...a)} (média ${Math.round(a.reduce((s, x) => s + x, 0) / a.length)})`;
  console.log(`info | itens-arte custo | itemforma.js ${sz('js/itemforma.js').toFixed(0)} KB, itemarte.js ${sz('js/itemarte.js').toFixed(0)} KB, itemicons.js ${sz('js/itemicons.js').toFixed(0)} KB · triângulos perto ${st(T[0])}, meio ${st(T[1])}, longe ${st(T[2])}`); }
console.log(nf ? `FALHOU: ${nf}` : 'PASSOU');
process.exit(nf ? 1 : 0);

// ---------------- part 10's process: the game loaded as the proofs in Node load it, the rule alone on people of its own ----------------
function verifier() {
  const M = require('../nodemundo.js'); M.load({ extra: ['js/itemforma.js', 'js/itemarte.js', 'js/itemicons.js'] });
  M.novo({ seed: 7, type: 'ilha', size: 48, tribes: 1 }); // (a world for the kit to ask: its people and their arts — none for these people of the proof's own)
  const IA = G.ItemArt, F = G.ItemForma; let nf = 0; const ok = (name, c, info) => { console.log(`${c ? 'PASSOU' : 'FALHOU'} | itens-arte ${name} | ${info}`); if (!c) nf++; };
    const more = []; window.QA = { more }; M.run('qa/itens-arte-inv.js'); window.QA = undefined;
  const ppl = [{ id: 1, name: 'Ari', age: 30, role: 'lenhador', act: 'chop' }, { id: 2, name: 'Bea', age: 25, role: 'guerreiro', act: null }, { id: 3, name: 'Caio', age: 70, role: 'anciao', act: null },
    { id: 4, name: 'Dina', age: 30, role: 'guerreiro', act: null, carry: { k: 'wood', n: 3 } }, { id: 5, name: 'Eli', age: 28, role: 'soldado', equip: { mao: 'espada.ferro', outra: 'escudo.bronze', costas: 'arco', cinto: 'faca.bronze', cabeca: 'elmo.bronze', corpo: 'couraca.ferro' },
      mochila: { 'espada.ferro': 1, 'escudo.bronze': 1, arco: 1, 'faca.bronze': 1, 'elmo.bronze': 1, 'couraca.ferro': 1 } }]; // (what is equipped is in the bag: D-336)
  const world = { villagers: new Map(ppl.map(v => [v.id, v])) };
  const check = () => { const out = []; for (const f of more) f((rule, sev, msg) => out.push(`${rule} S${sev}: ${msg}`), world); return out; };
  const bad = []; const clean = check(); if (!more.length) bad.push('a regra não se inscreveu no QA.more'); if (clean.length) bad.push('acusa um mundo são: ' + clean.join('; '));
  // (sabotages: a kind without its recipe, a key without its picture, a thing on the back without its place there — each on a fresh port)
  const sab = (name, f, undo) => { const fresh = new Map(); const keep = IA.raw; IA.raw = (k, l) => { const id = k + '/' + l; if (!fresh.has(id)) fresh.set(id, keep(k, l)); return fresh.get(id); }; f(); const got = check(); undo(); IA.raw = keep; if (!got.length) bad.push(`a sabotagem «${name}» passou calada`); return got[0] || ''; };
  const R0 = F.R.machado; const s1 = sab('o machado sem receita', () => { F.R.machado = undefined; IA.raw = ((r) => (k, l) => (k.startsWith('machado') ? null : r(k, l)))(IA.raw); }, () => { F.R.machado = R0; });
  const ic = G.ITEMICONS.img['lanca.pedra']; const s2 = sab('a lança sem figura', () => { delete G.ITEMICONS.img['lanca.pedra']; }, () => { G.ITEMICONS.img['lanca.pedra'] = ic; });
  const st = IA.stow; const s3 = sab('o arco sem lugar nas costas', () => { IA.stow = (k, p) => (k.startsWith('arco') ? null : st(k, p)); }, () => { IA.stow = st; });
  ok('verificador', !bad.length, bad.length ? bad.join('; ') : `${ppl.length} pessoas (o kit do ofício e as coisas de verdade) sem acusação; as sabotagens acusam — «${s1}», «${s2}», «${s3}»`);
  const e = M.erros(); if (Object.keys(e.mod).length || e.console.length) console.log(`FALHOU | itens-arte verificador | erros do jogo: ${JSON.stringify(e).slice(0, 300)}`);
  process.exit(nf ? 1 : 0);
}
