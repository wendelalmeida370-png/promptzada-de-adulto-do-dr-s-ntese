'use strict';
// ============================================================
//  The porte: how a body carries itself (22c fase 1, D-594, D-595)
//  — the years, the tiredness, the cold and the heat, the rain,
//  the sickness, the wound and the limp, the child to come, the
//  grief, the fear, the fury, the bold and the shy, the noble's
//  bearing. The reader (js/vida3d.js) says each cause, 0..1, in
//  I.porte; here they are eased (half a second: a cause that comes
//  or goes is never a jump) and laid on the pose as small additions
//  to the trunk, the head and the arms. The legs and the pace are
//  never added on top — that slides the standing foot —: they go
//  by the stride's own options (G.Gait: the cadence, the width,
//  the arms' swing, the lean), the foot still under the body.
//  Pure (rule 113): the numbers of the frame in, the pose out.
// ============================================================
(function (G) {
  const Anim = G.Anim3D = G.Anim3D || {};
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const TAU = Math.PI * 2;
  const KEYS = Anim.PORTE = ['velho', 'crianca', 'cansado', 'frio', 'calor', 'chuva', 'doente', 'ferido', 'manca', 'gravida', 'luto', 'medo', 'furia', 'confia', 'expans', 'nobre'];
  // the causes eased toward what the reader says (a.pz, the animator's memory): half a second to come, half to go
  Anim.porteEase = function (a, I, dt) {
    const P = I.porte; if (!P && !a.pz) return null;
    const z = a.pz || (a.pz = {}); const k = 1 - Math.exp(-(dt || 0) / 0.5); let any = false;
    for (let i = 0; i < KEYS.length; i++) { const q = KEYS[i]; const w = P ? P[q] || 0 : 0; const c = z[q] === undefined ? w : z[q]; const n = c + (w - c) * k; z[q] = Math.abs(n) < 1e-4 && !w ? 0 : n; if (z[q]) any = true; }
    if (!any && !P) a.pz = null; return a.pz;
  };
  // the stride's options from the porte and the tiredness (G.Gait.pose's o): the arms' swing kept, the lean, the cadence a factor of
  // the speed's own (the elder's and the cold's quicker, shorter steps; the hot noon's slower), the steps' width
  const GO = { arms: 1, lean: 0, cad: 1, wide: 0 };
  Anim.gaitOpts = function (a, I) {
    const p = a.pz, t = I.tired || 0, pu = 1 + 0.15 * clamp(a.pu || 0, -1, 1); if (!p && !t && pu === 1) return null;
    if (!p) { GO.arms = 1 - 0.45 * t; GO.lean = 0.06 * t; GO.cad = pu; GO.wide = 0; return GO; }
    GO.arms = clamp((1 - 0.45 * t) * (1 - 0.4 * p.velho) * (1 - 0.6 * p.frio) * (1 - 0.5 * p.luto) * (1 - 0.45 * p.medo) * (1 - 0.5 * p.nobre) * (1 - 0.3 * p.doente) * (1 - 0.3 * p.chuva) * (1 - 0.3 * p.gravida)
      * (1 + 0.2 * p.crianca) * (1 + 0.25 * p.furia) * (1 + 0.15 * p.expans), 0.15, 1.4);
    GO.lean = 0.06 * t + 0.13 * p.velho + 0.05 * p.frio + 0.07 * p.chuva + 0.08 * p.doente + 0.07 * p.luto + 0.06 * p.medo + 0.04 * p.furia - 0.05 * p.gravida - 0.03 * p.nobre - 0.03 * p.confia;
    GO.cad = clamp((1 + 0.12 * p.velho) * (1 + 0.08 * p.frio) * (1 + 0.06 * p.chuva) * (1 + 0.1 * p.medo) * (1 + 0.05 * p.gravida) * (1 + 0.08 * Math.abs(p.manca)) * (1 - 0.07 * p.calor) * (1 - 0.06 * p.nobre) * (1 - 0.04 * p.luto), 0.85, 1.25) * pu; // (pu: out of step with a neighbour, D-599)
    GO.wide = 0.018 * p.velho + 0.025 * p.gravida + 0.008 * p.frio;
    return GO;
  };
  // how much of the body the porte may move under a state: the stride and the standing postures all of it; seated, the trunk and
  // the arms less; lying, swimming, thrown down, none; under a clip, what the clip leaves — a gesture of the whole body with a thing
  // in the hand (the axe, the pick), a little; one of the top only, the legs' and a little of the arms'
  const LIE = new Set(['sleep', 'sick', 'swim', 'tread', 'drown', 'knocked', 'fall', 'jump', 'climb', 'crumple', 'rise', 'dance']);
  const SIT = new Set(['sit', 'eat', 'rock', 'rest', 'eatg', 'rockg', 'pray', 'cook']);
  function weights(base, C) {
    if (base === 'move') return W1;
    if (LIE.has(base)) return W0;
    if (C) { const arms = C.mask.has('shRp') || C.mask.has('shLp'), trunk = C.mask.has('lean'); WC.t = trunk ? (C.item ? 0.3 : 0.5) : 1; WC.a = arms ? (C.item ? 0.15 : 0.35) : 1; WC.sit = SIT.has(C.base) ? 1 : 0; WC.move = 0; return WC; }
    if (SIT.has(base)) return WS;
    return WI;
  }
  const W1 = { t: 1, a: 1, sit: 0, move: 1 }, W0 = { t: 0, a: 0, sit: 0, move: 0 }, WS = { t: 0.6, a: 0.5, sit: 1, move: 0 }, WI = { t: 1, a: 1, sit: 0, move: 0 }, WC = { t: 1, a: 1, sit: 0, move: 0 };
  // the porte laid on the pose (out), after the base, the action and the gesture over the top; base: the animator's ('move' in a
  // stride), C: the clip of the action (or null). I.clock: the world's seconds (the tremor, the breath, each one on their own
  // beat by I.id); I.lefty: the side a hurt arm or a hand to the chest takes
  Anim.porte = function (a, I, out, base, C) {
    const p = a.pz; if (!p) return out; const w = weights(base, C); if (!w.t && !w.a) return out;
    const id = I.id || 0, t = I.clock || 0, sd = I.lefty ? -1 : 1; const mv = w.move;
    const add = (j, x) => { out[j] = (out[j] || 0) + x; };
    // the trunk and the head (in a stride, the lean is the stride's own: GO.lean)
    if (!mv) add('lean', w.t * (0.11 * p.velho + 0.04 * p.cansado + 0.05 * p.frio + 0.06 * p.chuva + 0.1 * p.doente + 0.08 * p.luto + 0.05 * p.medo + 0.04 * p.furia - 0.06 * p.gravida - 0.03 * p.nobre - 0.03 * p.confia));
    add('neck', w.t * (0.1 * p.velho + 0.04 * p.cansado + 0.12 * p.frio + 0.07 * p.calor + 0.17 * p.chuva + 0.08 * p.doente + 0.26 * p.luto + 0.04 * p.medo + 0.1 * p.furia - 0.11 * p.crianca - 0.1 * p.nobre - 0.06 * p.confia));
    // (the grieving and the sick head a little to one side, each one's own: by the id)
    add('headR', w.t * (0.07 * p.luto + 0.04 * p.doente) * (id % 2 ? 1 : -1));
    // (the limp: over the stride the trunk leans over the bad leg while it stands, to spare it — the antalgic step —; standing,
    // the weight on the good leg, the trunk a little from the bad one)
    if (p.manca) { const bad = p.manca < 0 ? 0 : 1, m = Math.abs(p.manca); if (mv) { const pg = bad ? out.pgR : out.pgL; const on = pg >= 0 ? Math.sin(Math.PI * clamp(pg, 0, 1)) : 0; add('tilt', (bad ? -1 : 1) * 0.14 * m * on); add('neck', 0.04 * m * on); } else add('tilt', (bad ? 1 : -1) * 0.1 * m * w.t); }
    // (the cold: the body shivers — a tremor of ten a second in the trunk, the shoulders and the jaw —, each one on their own beat)
    if (p.frio > 0.25) { const q = Math.sin(TAU * 9.5 * t + id * 1.7) * clamp((p.frio - 0.25) / 0.5, 0, 1); add('twist', 0.018 * q); add('shLr', 0.025 * q); add('shRr', -0.025 * q); add('neck', 0.012 * q); }
    // (the tired, the frightened, the sick breathe deep and quick: the chest; each one on their own beat)
    { const b = 0.7 * p.cansado + 0.5 * p.medo + 0.3 * p.doente; if (b > 0.05) add('breath', b * Math.sin(t * (2.4 + 1.4 * p.medo) + id)); }
    // the arms (where the state leaves them free)
    const A = w.a; if (!A) return out;
    const both = (jl, jr, x, mirror) => { add(jl, x * A); add(jr, (mirror ? -x : x) * A); };
    // (the heat: the arms held off the body)
    both('shLr', 'shRr', 0.1 * p.calor, true); both('elL', 'elR', -0.05 * p.calor);
    // (the rain: the shoulders in, the elbows bent)
    both('shLr', 'shRr', -0.06 * p.chuva, true); both('elL', 'elR', 0.25 * p.chuva); both('shLp', 'shRp', -0.08 * p.chuva);
    // (fury: the fists, the elbows out a little)
    both('shLr', 'shRr', 0.08 * p.furia, true); both('elL', 'elR', 0.3 * p.furia); both('gripL', 'grip', p.furia);
    // (the elder: the elbows bent, the arms a little forward; the child: the arms loose and out)
    both('elL', 'elR', 0.25 * p.velho); both('shLp', 'shRp', -0.06 * p.velho); both('shLr', 'shRr', 0.1 * p.crianca, true);
    // (the tired: the arms hang, the shoulders in)
    both('elL', 'elR', -0.08 * p.cansado); both('shLr', 'shRr', -0.03 * p.cansado, true);
    // (the bold open, the shy drawn in)
    both('shLr', 'shRr', 0.03 * p.confia, true);
    // the hands to the body — to the points of it the arm reaches (Anim.REACH, the rig's own angles: D-597): the hurt arm held to the
    // side of the belly, walking too; the frightened hands at the chest; the cold, the arms in to the body and the hands on the belly
    // (walking: the arms in, the elbows bent); standing only, the sick one's hand on the chest, the grieving one's joined low, the
    // pregnant one's on the belly, the noble's behind the back. The leading hand is the right, or the left of the left-handed (I.lefty)
    const lead = sd > 0 ? 1 : -1, other = -lead;
    Anim.reachArm(out, other, 'ladoBarriga', 0.8 * p.ferido * A);
    Anim.reachArm(out, 1, 'peitoAlto', 0.7 * p.medo * A); Anim.reachArm(out, -1, 'peitoAlto', 0.7 * p.medo * A); both('gripL', 'grip', 0.6 * p.medo);
    if (mv) { both('shLr', 'shRr', -0.16 * p.frio, true); both('shLp', 'shRp', -0.22 * p.frio); both('elL', 'elR', 0.85 * p.frio); }
    else { Anim.reachArm(out, 1, 'barriga', 0.7 * p.frio * A); Anim.reachArm(out, -1, 'barriga', 0.7 * p.frio * A); }
    both('gripL', 'grip', 0.6 * p.frio);
    if (!mv && !w.sit) {
      Anim.reachArm(out, lead, 'peito', 0.85 * p.doente * A);
      Anim.reachArm(out, 1, 'juntas', 0.75 * p.luto * A); Anim.reachArm(out, -1, 'juntas', 0.75 * p.luto * A);
      Anim.reachArm(out, lead, 'barriga', 0.8 * p.gravida * A);
      Anim.reachArm(out, 1, 'costas', 0.85 * p.nobre * A); Anim.reachArm(out, -1, 'costas', 0.85 * p.nobre * A);
    } else if (mv) { both('shLp', 'shRp', -0.15 * p.luto); both('elL', 'elR', 0.4 * p.luto); }
    return out;
  };
})(window.G);
