'use strict';
// ============================================================
//  Feicao: the shape and the colours a person is drawn with
//  (22a, SOCIEDADE.md §3.2, D-542, D-551) — from their genome
//  (G.Genoma), their age, and what the world does to the body.
//  The skin, the hair and the eyes are the genome's colours (the
//  choice B' of the study: v.skin and v.hair are born as ever and
//  are only the seed of the colour of who was born before the
//  genome); the height is the genome's, about the height of their
//  age and sex. Only seen: nothing here is saved, nothing changes
//  the world, nothing draws a chance — one answer a person, kept
//  while what it reads is the same. A person with no genome (a
//  proof's bare person) is drawn as before: of(v) gives null.
// ============================================================
(function (G) {
  const F = G.Feicao = {};
  const MEMO = new Map(); G.worldHooks.push(() => MEMO.clear());
  const PH = new Float32Array(28);
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  // a gene as a standard score about the middle of every people (the alleles of a founder spread ±9 about 32: the mean of two, ≈ ±6.4)
  const z = p => (p - 0.5) / 0.1;
  F.of = function (v) {
    const Ge = G.Genoma; if (!v || !Ge || !Ge.valid(v.genoma)) return null;
    const age = v.age || 0, sig = v.genoma + (v.g === 'f' ? 'f' : 'm') + Math.floor(age * 4);
    let o = MEMO.get(v.id); if (o && o.sig === sig) return o;
    const P = Ge.pheno(v.genoma, PH), I = Ge.I;
    o = { sig };
    // (the colours: the skin by the melanin and the undertone, the hair by its colour and its red, the iris)
    o.skin = Ge.skinHex(P[I.melanina], P[I.subtom]);
    o.hair = Ge.hairHex(P[I.cabeloCor], P[I.cabeloRuivo]);
    const ir = Ge.irisRGB(P[I.olhoCor]); o.iris = '#' + ir.map(x => Math.round(clamp(x, 0, 1) * 255).toString(16).padStart(2, '0')).join('');
    // (the height: ±8% at the edges of the people's spread about the height of the age and sex — a child grows into it)
    const grow = clamp(0.4 + age / 16 * 0.6, 0.4, 1);
    o.alt = 1 + clamp(0.027 * z(P[I.altura]), -0.08, 0.08) * grow;
    MEMO.set(v.id, o); if (MEMO.size > 4000) MEMO.clear();
    return o;
  };
})(window.G);
