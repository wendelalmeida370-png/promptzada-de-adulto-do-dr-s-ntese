'use strict';
// ============================================================
//  Genoma: what a person looks like, as their own inheritance
//  (22a, SOCIEDADE.md §3.2, D-542, D-550) — 28 genes, two
//  alleles each (one from the mother, one from the father),
//  six bits an allele: 56 characters in the save (v.genoma).
//  A pure account: the person's id, the world's seed, the
//  parents' genomes and, for one born of no one the world
//  knows, their people and the sun of the land they began in.
//  Never a draw of the world's chance: the world is the same
//  to the last byte with it or without it. Nothing that
//  decides reads it — only what draws a person (G.Feicao, the
//  3D, the god's view): the look never decides (rule 194, 198).
//  The colours the pigment genes give are here too, with their
//  inverse: a save from before the genome keeps each person's
//  colour (the load gives their pigment from v.skin, v.hair).
// ============================================================
(function (G) {
  const Ge = G.Genoma = {};
  // the genes, in the order of the string (each 0..63; 32 the middle of every people)
  const GENES = Ge.GENES = Object.freeze(['melanina', 'subtom', 'cabeloCor', 'cabeloRuivo', 'cabeloTextura', 'olhoCor',
    'cranio', 'rostoLongo', 'mandibula', 'queixo', 'macas', 'arcada', 'narizLongo', 'narizLargo', 'narizPonte', 'labios',
    'olhosAfast', 'olhoTam', 'palpebra', 'orelhas', 'altura', 'massa', 'musculo', 'ombros', 'barbaDens', 'calvicie', 'sardas', 'sobrancelha']);
  const NG = Ge.NG = GENES.length, LEN = Ge.LEN = NG * 2;
  const GI = Ge.I = Object.freeze(Object.fromEntries(GENES.map((g, i) => [g, i])));
  const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  const DEC = new Int8Array(128).fill(-1); for (let i = 0; i < 64; i++) DEC[B64.charCodeAt(i)] = i;
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);

  // ------------------------------ the hash ------------------------------
  // (32 bits, Math.imul: the same in every engine. G.hash gives a hundred thousand values and leaves the seed out: the id 1 of
  // every world would have the same face — the study §2. Here the world's seed is in every draw)
  const h32 = Ge.h32 = function (seed, a, b, c) {
    let x = Math.imul(a | 0, 0x9E3779B1) ^ Math.imul(b | 0, 0x85EBCA77) ^ Math.imul(c | 0, 0xC2B2AE3D) ^ Math.imul((seed | 0) ^ 0x5BD1E995, 0x27D4EB2F);
    x ^= x >>> 16; x = Math.imul(x, 0x7FEB352D); x ^= x >>> 15; x = Math.imul(x, 0x846CA68B); x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  };
  // the inverse of the normal (Acklam's): a founder's genes spread about their people's middle
  function normInv(p) {
    const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924], b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
    const c = [-7.78489400243029e-3, -0.322396458041136, -2.40076064543316, -2.54973253934197, 4.37466414146297, 2.93816398269878], d = [7.78469570904146e-3, 0.32246712907004, 2.445134137143, 3.75440866190742];
    const q0 = clamp(p, 1e-9, 1 - 1e-9);
    if (q0 < 0.02425) { const q = Math.sqrt(-2 * Math.log(q0)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    if (q0 > 1 - 0.02425) { const q = Math.sqrt(-2 * Math.log(1 - q0)); return -(((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1); }
    const q = q0 - 0.5, r = q * q; return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
  }
  Ge.normInv = normInv;

  // ------------------------------ the string ------------------------------
  Ge.valid = s => {
    if (typeof s !== 'string' || s.length !== LEN) return false;
    for (let i = 0; i < LEN; i++) { const c = s.charCodeAt(i); if (c > 127 || DEC[c] < 0) return false; }
    return true;
  };
  const enc = al => { let s = ''; for (let i = 0; i < al.length; i++) s += B64[al[i]]; return s; };
  const dec = s => { const a = new Uint8Array(LEN); for (let i = 0; i < LEN; i++) a[i] = DEC[s.charCodeAt(i)]; return a; };
  Ge.alleles = s => (Ge.valid(s) ? dec(s) : null);
  Ge.encode = al => enc(al);
  // the phenotype: each gene the mean of its two alleles (additive: children fall between their parents, siblings differ),
  // 0..1 (0.5 the middle)
  Ge.pheno = function (s, out) {
    const o = out || new Float32Array(NG); if (!Ge.valid(s)) { o.fill(0.5); return o; }
    for (let g = 0; g < NG; g++) o[g] = (DEC[s.charCodeAt(g * 2)] + DEC[s.charCodeAt(g * 2 + 1)]) / 126;
    return o;
  };

  // ------------------------------ the founders ------------------------------
  // A people's founding pool: for each gene its middle and spread (0..63). Most genes of the face have the same middle in every
  // people — the variety within a people is larger than between them —; the peoples differ in the pigment, the hair, the eye
  // and a little in the height, the cheekbones and the nose. Nothing here is about who a person is: only how they look
  const DEF = [32, 9];
  const POOL = Ge.POOL = {
    nordico: { melanina: [6, 4], subtom: [34, 10], cabeloCor: [40, 12], cabeloRuivo: [16, 12], cabeloTextura: [18, 10], olhoCor: [42, 14], altura: [38, 7], narizPonte: [36, 8], sardas: [38, 12], sobrancelha: [26, 9] },
    grego: { melanina: [18, 5], subtom: [36, 8], cabeloCor: [12, 7], cabeloRuivo: [8, 6], olhoCor: [16, 10], narizPonte: [40, 8], cabeloTextura: [36, 10], sobrancelha: [36, 9] },
    romano: { melanina: [19, 5], subtom: [34, 8], cabeloCor: [12, 7], cabeloRuivo: [8, 6], olhoCor: [14, 9], narizLongo: [38, 8], cabeloTextura: [30, 10], sobrancelha: [36, 9] },
    egipcio: { melanina: [36, 7], subtom: [30, 8], cabeloCor: [4, 3], cabeloRuivo: [4, 3], olhoCor: [6, 4], narizLongo: [36, 8], cabeloTextura: [38, 12], barbaDens: [24, 10], sardas: [10, 6], sobrancelha: [38, 8] },
    asteca: { melanina: [36, 5], subtom: [28, 8], cabeloCor: [3, 2], cabeloRuivo: [3, 2], olhoCor: [5, 3], macas: [40, 8], cabeloTextura: [10, 6], altura: [26, 7], barbaDens: [12, 8], narizPonte: [38, 8], sardas: [8, 5], sobrancelha: [30, 8] },
  };
  // (one of no people — the first tribes, a wanderer: every colour of the world)
  const ANY = { melanina: [26, 14], cabeloCor: [16, 13], cabeloRuivo: [10, 9], olhoCor: [16, 13], cabeloTextura: [28, 14] };
  // a founder's genome: both alleles of each gene drawn about their people's middle by the hash of the id and the seed; the
  // melanin follows the sun of the land where they began (sun −1 cold .. 1 hot: ±6 units)
  Ge.founder = function (id, civ, sun, seed) {
    const P = POOL[civ] || ANY, al = new Uint8Array(LEN);
    for (let g = 0; g < NG; g++) {
      const [m, sd] = P[GENES[g]] || DEF; const mm = m + (g === 0 ? clamp(sun || 0, -1, 1) * 6 : 0);
      for (let k = 0; k < 2; k++) al[g * 2 + k] = clamp(Math.round(mm + sd * normInv(h32(seed, id, g, k + 1))), 0, 63);
    }
    return enc(al);
  };
  // a child's: one allele of each gene from the mother and one from the father — which of each parent's two, by the hash of the
  // child's id and the seed (twins differ: their ids do) — and, in two alleles in a hundred, a small change
  Ge.child = function (id, mg, fg, seed) {
    const M = dec(mg), F = dec(fg), al = new Uint8Array(LEN);
    for (let g = 0; g < NG; g++) {
      al[g * 2] = M[g * 2 + (h32(seed, id, g, 11) < 0.5 ? 0 : 1)]; al[g * 2 + 1] = F[g * 2 + (h32(seed, id, g, 12) < 0.5 ? 0 : 1)];
      for (let k = 0; k < 2; k++) if (h32(seed, id, g, 13 + k) < 0.02) al[g * 2 + k] = clamp(al[g * 2 + k] + Math.round(normInv(h32(seed, id, g, 15 + k)) * 4), 0, 63);
    }
    return enc(al);
  };
  // (each allele of a child is one of its mother's or its father's — or a step of a mutation away from one: what the verifier
  // asks of a genome somebody wrote by hand)
  Ge.fromParents = function (cg, mg, fg) {
    const C = Ge.alleles(cg), M = Ge.alleles(mg), F = Ge.alleles(fg); if (!C || !M || !F) return true;
    for (let g = 0; g < NG; g++) {
      const near = (x, P) => Math.min(Math.abs(x - P[g * 2]), Math.abs(x - P[g * 2 + 1])) <= 16;
      if (!near(C[g * 2], M) || !near(C[g * 2 + 1], F)) return false;
    }
    return true;
  };

  // ------------------------------ the colours (only what they look like) ------------------------------
  // Each colour is a point of a smooth surface in the CIE L*a*b* space, driven by two genes: the skin by the melanin (its
  // lightness, from a pale north to a deep brown) and the undertone (rosy to golden); the hair by its colour (black to the
  // palest blond) and its red. Pure maths — the same in every view: G.Feicao draws by it, and the load of a save from before
  // the genome finds the pigment of each person's saved colour on it (fromLook)
  const deg = Math.PI / 180;
  Ge.skinLab = function (m, u) { // (m the melanin, u the undertone: 0..1)
    const L = 90.5 - 66 * m;
    const C0 = L > 61 ? 35.5 - 0.026 * (L - 61) * (L - 61) : 35.5 - 0.0125 * (61 - L) * (61 - L);
    const C = Math.max(6, C0 + (u - 0.5) * 12), h = (64.5 + (L - 61) * 0.1 + (u - 0.5) * 15) * deg;
    return [L, C * Math.cos(h), C * Math.sin(h)];
  };
  Ge.hairLab = function (c, r) { // (c the colour: 0 black .. 1 the palest blond; r the red: 0..1)
    const L = 6 + 79 * Math.pow(c, 1.1) + r * 8 * (1 - c), sc = Math.sin(Math.min(c, 1) * Math.PI * 0.7);
    const C = 2 + 46 * sc * sc + r * 36 * (0.4 + 0.6 * Math.sin(Math.min(1, c + 0.2) * Math.PI * 0.75));
    const h = (58 + 34 * c * c - r * 16) * deg;
    return [L, C * Math.cos(h), C * Math.sin(h)];
  };
  // the iris: dark brown, brown, amber, hazel, green, grey-blue, blue (the olhoCor gene along them)
  const IRIS = [[0.18, 0.11, 0.06], [0.26, 0.15, 0.08], [0.36, 0.22, 0.1], [0.42, 0.36, 0.18], [0.36, 0.42, 0.26], [0.36, 0.45, 0.52], [0.27, 0.42, 0.6]];
  Ge.irisRGB = function (e) { const t = clamp(e, 0, 1) * (IRIS.length - 1), i = Math.min(IRIS.length - 2, Math.floor(t)), f = t - i; return IRIS[i].map((x, k) => x + (IRIS[i + 1][k] - x) * f); };
  // (L*a*b* ↔ sRGB 0..255, D65)
  Ge.lab2rgb = function (L, a, b) {
    const fy = (L + 16) / 116, fx = fy + a / 500, fz = fy - b / 200;
    const inv = t => (t * t * t > 0.008856 ? t * t * t : (t - 16 / 116) / 7.787);
    const X = inv(fx) * 0.9505, Y = inv(fy), Z = inv(fz) * 1.089;
    const lin = [3.2406 * X - 1.5372 * Y - 0.4986 * Z, -0.9689 * X + 1.8758 * Y + 0.0415 * Z, 0.0557 * X - 0.204 * Y + 1.057 * Z];
    return lin.map(c => { c = clamp(c, 0, 1); return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055)); });
  };
  Ge.rgb2lab = function (rgb) {
    const lin = rgb.map(c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); });
    const X = (0.4124 * lin[0] + 0.3576 * lin[1] + 0.1805 * lin[2]) / 0.9505, Y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2], Z = (0.0193 * lin[0] + 0.1192 * lin[1] + 0.9505 * lin[2]) / 1.089;
    const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))];
  };
  const hex = rgb => '#' + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
  const rgbOf = h => { const n = parseInt(String(h).slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  Ge.skinHex = (m, u) => hex(Ge.lab2rgb(...Ge.skinLab(m, u)));
  Ge.hairHex = (c, r) => hex(Ge.lab2rgb(...Ge.hairLab(c, r)));
  // the two genes (as the sum of their two alleles, 0..126) whose colour is nearest a saved one — the whole grid searched once a
  // colour (a save has a dozen skins and a dozen hairs), kept
  const NEAR = new Map();
  function nearest(kind, h) {
    const key = kind + h; let r = NEAR.get(key); if (r) return r;
    const t = Ge.rgb2lab(rgbOf(h)); const f = kind === 's' ? Ge.skinLab : Ge.hairLab; let best = 1e9; r = [63, 63, 0];
    for (let i = 0; i <= 126; i++) for (let j = 0; j <= 126; j++) { const q = f(i / 126, j / 126); const d = (q[0] - t[0]) ** 2 + (q[1] - t[1]) ** 2 + (q[2] - t[2]) ** 2; if (d < best) { best = d; r = [i, j, Math.sqrt(d)]; } }
    NEAR.set(key, r); return r;
  }
  Ge.nearest = nearest;
  // a genome whose pigment is a saved colour — the skin, the hair —, the other genes kept (a save from before the genome: the
  // person keeps the colour they had)
  Ge.withLook = function (s, skin, hair) {
    const al = dec(s);
    const put = (g, sum) => { al[g * 2] = sum >> 1; al[g * 2 + 1] = sum - (sum >> 1); };
    if (/^#[0-9a-f]{6}$/i.test(skin || '')) { const r = nearest('s', skin.toLowerCase()); put(GI.melanina, r[0]); put(GI.subtom, r[1]); }
    if (/^#[0-9a-f]{6}$/i.test(hair || '')) { const r = nearest('h', hair.toLowerCase()); put(GI.cabeloCor, r[0]); put(GI.cabeloRuivo, r[1]); }
    return enc(al);
  };

  // ------------------------------ the world's doors ------------------------------
  // (the only place this file reads the world: the seed, the sun of a place, who is born and who was saved — rule 199)
  // whoever is born or comes into the world (Vg.born, D-541): the parents' genomes, or the founder's people and the sun of where
  // they begin. One with a genome of their own already (back from the dead, come from elsewhere) keeps it
  const sunAt = (S, x, y) => { const W = G.W; if (!S.temp || !W || !W.inb || !W.inb(x, y)) return 0; return (S.temp[W.idx(x, y)] / 255 - 0.5) * 2; };
  Ge.bornOf = function (v, m, f) {
    const S = G.S, seed = S.seed | 0;
    const mg = m && Ge.valid(m.genoma) ? m.genoma : null, fg = f && Ge.valid(f.genoma) ? f.genoma : null;
    if (mg || fg) {
      // (a parent the world has forgotten stands in as a founder of the child's people: the child of a known mother and an
      // unknown father is still half hers)
      const stand = () => Ge.founder(-(v.id | 0) - 1, v.civ, sunAt(S, v.x, v.y), seed);
      return Ge.child(v.id, mg || stand(), fg || stand(), seed);
    }
    return Ge.founder(v.id, v.civ, sunAt(S, v.x, v.y), seed);
  };
  if (G.Vg && G.Vg.born) G.Vg.born.push(function (v, m, f) { if (!Ge.valid(v.genoma)) v.genoma = Ge.bornOf(v, m, f); });
  // a save from before the genome: everyone gets one at the load, the living and the dead, in the order they were born (the
  // parents before the children: a child of parents who had it inherits theirs), the pigment from the colour saved — the same
  // save opened twice gives the same genomes; nothing of the world decided by it (L-419)
  Ge.fill = function () {
    const S = G.S; if (!S) return 0;
    const all = []; for (const m of [S.villagers, S.dead]) if (m) for (const p of m.values()) if (!Ge.valid(p.genoma)) all.push(p);
    if (!all.length) return 0;
    const born = p => (Number.isFinite(p.born) ? p.born : Number.isFinite(p.died) && Number.isFinite(p.age) ? p.died - p.age : -1e9);
    all.sort((a, b) => born(a) - born(b) || a.id - b.id);
    for (const p of all) {
      const m = p.mother ? G.person(p.mother) : null, f = p.father ? G.person(p.father) : null;
      const mg = m && Ge.valid(m.genoma) ? m.genoma : null, fg = f && Ge.valid(f.genoma) ? f.genoma : null;
      const fa = !p.civ && p.fac && G.Fac && G.Fac.get ? G.Fac.get(p.fac) : null; const civ = p.civ || (fa && fa.civ) || null, seed = S.seed | 0;
      const g = mg || fg ? Ge.child(p.id, mg || Ge.founder(-p.id - 1, civ, 0, seed), fg || Ge.founder(-p.id - 1, civ, 0, seed), seed) : Ge.founder(p.id, civ, 0, seed);
      p.genoma = Ge.withLook(g, p.skin, p.hair);
    }
    return all.length;
  };
  (G.saveHooks = G.saveHooks || []).push({ save() { }, load() { Ge.fill(); } });
})(window.G);
