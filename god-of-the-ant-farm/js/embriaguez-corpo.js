'use strict';
// ============================================================
//  O corpo bêbado (G.EbrioCorpo; a bebedeira, T2 — D-837).
//  O que o corpo do deus sente do que bebeu, e só se vê: o olho que
//  balança e se inclina (o cam3d.js pede o EbrioCorpo.olho e o põe por
//  cima do olho do jogador — nem o rumo nem a inclinação dele mudam,
//  regra 124), a vista turva e dobrada (o post3d.js lê o
//  EbrioCorpo.vista num uniforme; sem o pós-processamento, um desfoque
//  da tela inteira) e o passo que puxa para os lados, o rumo que
//  oscila (o avatar.js pede o EbrioCorpo.puxa: a vontade das mãos
//  desviada; o giro do corpo continua o de sempre, sem estalo — regra
//  120). O quanto vem do mundo: o álcool no sangue do corpo contra o
//  que a pessoa aguenta (G.Ebrio.k), que chega e vai como o sangue vai.
//  As fases do balanço são do acaso do que só se vê (G.VR), nunca do
//  mundo, e o relógio é o do quadro; não escreve nada do mundo.
// ============================================================
(function (G) {
  const C = G.EbrioCorpo = {};
  let ph = null, kNow = 0, tOlho = 0, tPe = 0, filt = '';
  G.worldHooks.push(() => { ph = null; kNow = 0; tOlho = 0; tPe = 0; });
  // (the phases of one's own sway, drawn once from the chance of what is only seen)
  const phases = () => ph || (ph = [0, 1, 2, 3, 4, 5, 6, 7].map(() => G.VR() * 6.2832));
  // (how much the drink is in the body now: the world's, G.Ebrio.k — none asleep, nor out: the screen is dark then)
  function want() { const v = G.Possess && G.Possess.body ? G.Possess.body() : null; return v && G.Ebrio && !v.sleeping ? G.Ebrio.k(v) : 0; }
  C.k = () => kNow;
  // the eye, once a frame (cam3d.js): the drink eased in as the blood takes it, and the sway and the lean of the look — or null, sober.
  // { x, y, z: metres the look is thrown about, roll: radians the picture leans }
  C.olho = function (rdt) {
    const h = Number.isFinite(rdt) && rdt > 0 ? Math.min(rdt, 0.25) : 0; const k = want();
    kNow += (k - kNow) * (1 - Math.exp(-1.2 * h)); if (kNow < 1e-3) kNow = k > 0 ? kNow : 0; tOlho += h;
    blurFallback();
    if (kNow < 0.01) return null;
    const p = phases(), t = tOlho, k2 = kNow * kNow;
    const roll = (Math.sin(t * 0.37 + p[0]) * 0.05 + Math.sin(t * 0.91 + p[1]) * 0.018) * kNow;
    return { x: (Math.sin(t * 0.53 + p[2]) * 0.16 + Math.sin(t * 1.27 + p[3]) * 0.05) * k2, y: Math.sin(t * 0.71 + p[4]) * 0.07 * k2, z: Math.sin(t * 0.47 + p[5]) * 0.16 * k2, roll };
  };
  // the picture (post3d.js, its last pass): [how much — the blur and the second image —, the second image's offset x, y (of the picture),
  // the blur's reach] — or null, sober
  C.vista = function () {
    if (kNow < 0.01) return null; const p = phases(), t = tOlho, k = kNow;
    return [Math.min(1, k * 1.1), (Math.sin(t * 0.63 + p[6]) * 0.6 + 0.4) * 0.011 * k, Math.cos(t * 0.49 + p[7]) * 0.005 * k, 0.0035 * k];
  };
  // (with no pass after the picture — the lowest quality —: the canvas itself blurred by as much, only while drunk)
  function blurFallback() {
    const R = G.Realm; const ren = R && R.renderer ? R.renderer() : null; const cv = ren && ren.domElement; if (!cv || !cv.style) return;
    const w = !(G.Post3D && G.Post3D.on) && kNow > 0.05 ? `blur(${(kNow * 2.2).toFixed(1)}px)` : '';
    if (w !== filt) { filt = w; cv.style.filter = w; }
  }
  // the feet (avatar.js, the ground's step): the way the hands want, turned a little to one side and the other as the drink sways the
  // body — the turn of the body is the controller's own (steer) —, and the push a little short of the whole. → [wx, wz, wl] or null
  C.puxa = function (wx, wz, wl, h) {
    tPe += Number.isFinite(h) && h > 0 ? h : 0; if (kNow < 0.02 || !(wl > 0.05)) return null;
    const p = phases(), t = tPe, k = kNow;
    const a = (Math.sin(t * 0.83 + p[1]) * 0.32 + Math.sin(t * 2.1 + p[3]) * 0.12) * k; const c = Math.cos(a), s = Math.sin(a);
    return [wx * c - wz * s, wx * s + wz * c, wl * (1 - 0.15 * k)];
  };
})(window.G);
