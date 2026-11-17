'use strict';
// ============================================================
//  The idle (22c fase 2, D-599): the little things a person does
//  standing, seated or waiting — a look round, a hand to the nape,
//  the hands on the hips or behind the back, a stretch, a yawn, the
//  hands rubbed in the cold, the face fanned in the heat, a cough,
//  the eyes wiped in grief, a nod to someone known passing… — one
//  every five to twelve seconds, each one on their own beat, chosen
//  by what the reader says of them (I.ctx: the cold, the heat, the
//  tiredness, the grief, the wait, someone known near…) and by
//  their own three favourite tics (the same person always scratches
//  the same way). Pure (rule 113, rule 218): a sum of the person's
//  id and the world's clock (I.clock) — no chance, no memory: the
//  same person at the same moment does the same thing from any
//  eye. Never the same thing twice in a row: a person's things are
//  split in two by their own order, and one moment draws from one
//  half, the next from the other.
// ============================================================
(function (G) {
  const Anim = G.Anim3D = G.Anim3D || {};
  const H = i => G.hash(i);
  // the things and what makes each more likely (the weights of the context's causes); small: only near the eye (the middle level
  // of detail draws the big ones only, the far one none)
  const OCIO = Anim.OCIO = {
    'oc-olhar-volta': { base: 1.2 }, 'oc-olhar-chao': { base: 0.7, luto: 2, timido: 1.5 }, 'oc-olhar-ceu': { base: 0.4, chuva: 2, calor: 0.8, tarde: 1 },
    'oc-olhar-porta': { espera: 2.5 }, 'oc-acenar-cabeca': { conhecido: 3, notavel: 2, small: 1 },
    'oc-cocar-cabeca': { base: 1, small: 1 }, 'oc-cocar-nuca': { base: 1, calor: 0.5, small: 1 }, 'oc-cocar-braco': { base: 0.8, frio: 1.5, small: 1 }, 'oc-cocar-queixo': { base: 0.8, espera: 0.8, small: 1 },
    'oc-ajeitar-cinto': { base: 0.8, small: 1 }, 'oc-ajeitar-cabelo': { base: 0.8, calor: 0.6, small: 1 }, 'oc-ajeitar-roupa': { base: 0.8, frio: 0.8, small: 1 },
    'oc-bracos-cruzados': { base: 0.9, confia: 2 }, 'oc-maos-costas': { base: 0.7, nobre: 3, gravida: 1 }, 'oc-maos-juntas': { base: 0.7, espera: 1, timido: 2, luto: 1.5, frio: 1 },
    'oc-espreguicar': { cansado: 2, manha: 1 }, 'oc-bocejar': { cansado: 2.5, manha: 1 }, 'oc-suspirar': { base: 0.3, luto: 2.5, cansado: 1, espera: 0.5 },
    'oc-esfregar-maos': { frio: 3 }, 'oc-soprar-maos': { frio: 3 }, 'oc-abanar-se': { calor: 3 }, 'oc-enxugar-testa': { calor: 2.5, cansado: 1 },
    'oc-tossir': { doente: 3 }, 'oc-mao-peito': { doente: 2, medo: 1 }, 'oc-enxugar-olhos': { luto: 3 }, 'oc-arquejar': { cansado: 1.5 },
    'oc-tamborilar': { espera: 2.5, small: 1 }, 'oc-afagar-barriga': { gravida: 3 }, 'oc-solucar': { bebado: 3 }, 'oc-apoiar': { bebado: 2.5 },
    'oc-apontar': { notavel: 1.5 }, 'oc-acenar': { conhecido: 2.5 },
  };
  const LIST = Anim.OCIO_LIST = Object.keys(OCIO);
  // (the things that are only habit — no cause asks them —: where each person's favourite tics are chosen)
  const HABIT = LIST.filter(k => OCIO[k].base > 0);
  // the gap between two things, a person's own (5.5 to 12.5 s), and the phase of their beat
  const gapOf = id => 5.5 + 7 * H(id * 17 + 3), offOf = (id, g) => H(id * 29 + 5) * g;
  // (each thing's half for this person — the person's own order of the things, split by turns: every cause has things in both halves)
  const halfOf = (id, i) => { let r = 0; const hi = H(id * 131 + i * 7919); for (let j = 0; j < LIST.length; j++) if (j !== i && H(id * 131 + j * 7919) < hi) r++; return r & 1; };
  // (a person's three tics: their own picks among the habits)
  const ticOf = (id, k) => { const i = HABIT.indexOf(k); if (i < 0) return false; const r = []; for (let q = 0; q < HABIT.length; q++) r.push([H(id * 53 + q * 311), q]); r.sort((a, b) => a[0] - b[0] || a[1] - b[1]); return r[0][1] === i || r[1][1] === i || r[2][1] === i; };
  // (a person's halves and tics, kept: the same sums every time, made once — a cache of a pure answer)
  const MEMO = new Map();
  function own(id) { let m = MEMO.get(id); if (m) return m; if (MEMO.size > 4096) MEMO.clear();
    m = { half: new Uint8Array(LIST.length), tic: new Uint8Array(LIST.length) }; for (let i = 0; i < LIST.length; i++) { m.half[i] = halfOf(id, i); m.tic[i] = ticOf(id, LIST[i]) ? 1 : 0; } MEMO.set(id, m); return m; }
  // the thing a person is doing now, if any: { k (its clip), u (0..1 through it), n (the moment's number) } — id, the world's clock
  // t (seconds), ctx the reader's weights ({ base: 1, frio, calor, … }), lod the level of detail (2: none; 1: the big ones)
  Anim.ocioAt = function (id, t, ctx, lod) {
    if (!ctx || lod >= 2 || !Anim.CLIPS) return null;
    const g = gapOf(id), x = t + offOf(id, g), n = Math.floor(x / g), tau = x - n * g; if (tau > 5) return null;
    // (the weights of this moment's half: what the context asks, three times a tic)
    let tot = 0; const half = n & 1; const W = WTS; W.length = 0; const m = own(id);
    for (let i = 0; i < LIST.length; i++) {
      const k = LIST[i], o = OCIO[k], C = Anim.CLIPS[k]; if (!C || (lod >= 1 && o.small) || m.half[i] !== half) { W.push(0); continue; }
      let w = 0; for (const c in o) if (c !== 'small' && ctx[c] > 0) w += o[c] * ctx[c];
      if (w > 0 && m.tic[i]) w *= 3; W.push(w); tot += w;
    }
    if (!(tot > 0)) return null;
    let r = H(id * 977 + n * 131) * tot, i = 0; for (; i < W.length - 1; i++) { r -= W[i]; if (r < 0 && W[i] > 0) break; }
    while (i > 0 && !(W[i] > 0)) i--; const k = LIST[i], C = Anim.CLIPS[k]; if (!(W[i] > 0)) return null;
    const dur = C.dur * (0.88 + 0.24 * H(id * 13 + n * 17)); if (tau >= dur) return null;
    OUT.k = k; OUT.u = tau / dur; OUT.n = n; OUT.dur = dur; return OUT;
  };
  const WTS = [], OUT = { k: '', u: 0, n: 0, dur: 0 };
  // (for the proofs and the reader: a person's three tics, and the half each thing falls in)
  Anim.ocioTics = id => HABIT.filter(k => ticOf(id, k));
  Anim.ocioHalf = (id, k) => halfOf(id, LIST.indexOf(k));
})(window.G);
