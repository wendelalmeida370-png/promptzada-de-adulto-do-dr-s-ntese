'use strict';
// ============================================================
//  The face of the people (22c, SOCIEDADE.md §3.3, D-543): the
//  faces of the feelings, a face easing from one to the next, the
//  blink of each one on their own beat, and the numbers the skin
//  paints the face with — cut from js/people3d.js without a
//  change. Pure (rule 113): nothing here reads the world.
// ============================================================
(function (G) {
  const Anim = G.Anim3D = G.Anim3D || {};
  // (the faces of the feelings: smile (−1 frown .. 1), brows up, anger, grief, eyes wide, eyes smiling, the jaw open, blush)
  const MOOD = Anim.MOOD = {
    calm: { smile: 0.12 }, chat: { smile: 0.3 }, food: { smile: 0.3 }, fish: { smile: 0.35 }, wood: { smile: 0.2 }, star: { smile: 0.7, wide: 0.35, up: 0.3 },
    happy: { smile: 0.9, squint: 0.55, jaw: 0.25 }, joy: { smile: 1, squint: 0.6, jaw: 0.4 }, heart: { smile: 0.65, squint: 0.35, blush: 0.4 },
    sad: { smile: -0.6, up: 0.15, sad: 1 }, angry: { smile: -0.45, angry: 1, squint: 0.3, jaw: 0.08 }, fear: { smile: -0.3, up: 1, wide: 1, jaw: 0.45 }, fire: { smile: -0.3, up: 1, wide: 1, jaw: 0.4 },
    awe: { smile: 0.1, up: 0.9, wide: 0.6, jaw: 0.35 }, question: { up: 0.65, smile: -0.05 }, sick: { smile: -0.35, sad: 0.6, squint: 0.45 }, zzz: { squint: 0.75 }, pray: { squint: 0.8, smile: 0.1 },
    drunk: { smile: 0.45, squint: 0.55, blush: 0.7, jaw: 0.1 },
  };
  const FACE = ['smile', 'up', 'angry', 'sad', 'wide', 'squint', 'jaw', 'blush'];
  // (a face moves from one feeling to the next in a third of a second or so, never at once — the view's own memory)
  const easeMood = Anim.easeMood = function (s, md, dt) { const m = s.mood || (s.mood = {}); const k = 1 - Math.exp(-6 * (dt || 0)); for (const f of FACE) { const w = md[f] || 0; m[f] = m[f] === undefined ? w : m[f] + (w - m[f]) * k; } return m; };

  // ------------------------------ the living face (22c fase 2, D-601) ------------------------------
  // pose.face: the channels of the face (G.Rosto.CH, their order — a Float32Array a pose), written only here (rule 216), each frame
  // a person is posed: the mood beneath (I.humor, the society's G.Indole.humor), the feeling of the moment (the eased mood of the
  // world's emotion: s.mood), the porte (the cold's chattering teeth and pale lips, the heat's sweat and squint, the sick one's
  // pallor, the wound's grimace, the grief's brows and tears, the fear's wide eyes, the fury's brows down and the lips pressed, the
  // drink's flush and crooked smile), the little thing of the moment (the yawn's jaw, the blow into the hands' lips, the cough),
  // the blink, the look, and the speech: simple visemes — the «a» on the jaw, the «o u» on the pucker, the «m b p» on the press, the
  // «e i» on the stretch — cycling by the world's clock while the mouth talks
  const RO = G.Rosto, X = RO ? RO.IDX : {}, NCH = RO ? RO.CH.length : 0;
  const TAU = Math.PI * 2;
  const T = RO ? new Float32Array(NCH) : null;
  const V_A = [1, 0, 0, 0], V_O = [0.45, 0.9, 0, 0], V_M = [0.05, 0, 1, 0], V_E = [0.55, 0, 0, 0.9], VIS = [V_A, V_O, V_A, V_M, V_E, V_A, V_O, V_E];
  // m: the view's own memory of someone (its eased face kept in m.fz); I: the frame's numbers (id, clock, drunk, humor); pose: their
  // pose (its talk, blink, gaze); md: the eased mood; a: the animator's memory (the porte eased, a.pz; the idle's thing, a.oc, a.ocU)
  Anim.faceMix = function (m, I, pose, md, a, dt) {
    if (!RO) return null; const F = pose.face && pose.face.length === NCH ? pose.face : (pose.face = RO.fresh());
    T.set(RO.REST); md = md || MOOD.calm; const t = I.clock || 0, id = I.id || 0; const p = (a && a.pz) || NOP, oc = a && a.oc;
    // the mood beneath and the feeling of the moment
    const hu = I.humor || 0;
    T[X.smile] = (md.smile || 0) + 0.25 * hu; T[X.browUp] = md.up || 0; T[X.browIn] = md.angry || 0; T[X.browSad] = (md.sad || 0) + 0.3 * Math.max(0, -hu);
    T[X.wide] = md.wide || 0; T[X.squint] = md.squint || 0; T[X.jaw] = md.jaw || 0; T[X.blush] = md.blush || 0;
    // the porte on the face
    T[X.press] += 0.3 * p.frio + 0.5 * p.furia; T[X.pale] += 0.25 * p.frio + 0.6 * p.doente + 0.4 * p.medo;
    T[X.sweat] += 0.8 * p.calor + 0.3 * p.doente + 0.35 * p.cansado; T[X.squint] += 0.3 * p.calor + 0.12 * p.cansado; T[X.blush] += 0.2 * p.calor;
    T[X.browSad] += 0.2 * p.cansado + 0.3 * p.doente + 0.8 * p.luto + 0.2 * p.medo; T[X.pain] += 0.6 * p.ferido + 0.15 * p.doente;
    T[X.cry] += 0.6 * p.luto; T[X.smile] -= 0.4 * p.luto + 0.2 * p.medo + 0.3 * p.furia + 0.15 * p.doente;
    T[X.wide] += 0.8 * p.medo; T[X.browUp] += 0.7 * p.medo; T[X.stretch] += 0.3 * p.medo; T[X.browIn] += 0.9 * p.furia; T[X.sneer] += 0.3 * p.furia;
    const dk = I.drunk || 0; if (dk > 0) { T[X.blush] += 0.7 * dk; T[X.smileSide] += 0.4 * dk; T[X.squint] += 0.3 * dk; T[X.smile] += 0.3 * dk; }
    // the little thing of the moment
    if (oc) { const u = a.ocU || 0, mid = Math.sin(Math.PI * Math.max(0, Math.min(1, u)));
      if (oc === 'oc-bocejar') { T[X.jaw] = Math.max(T[X.jaw], 0.85 * mid); T[X.squint] += 0.7 * mid; }
      else if (oc === 'oc-espreguicar') { T[X.jaw] = Math.max(T[X.jaw], 0.45 * mid); T[X.squint] += 0.6 * mid; }
      else if (oc === 'oc-soprar-maos' || oc === 'oc-suspirar') T[X.pucker] += 0.8 * mid;
      else if (oc === 'oc-tossir') { T[X.jaw] = Math.max(T[X.jaw], 0.35 * mid); T[X.pain] += 0.3 * mid; T[X.squint] += 0.4 * mid; }
      else if (oc === 'oc-enxugar-olhos') T[X.squint] += 0.4 * mid; }
    // eased toward it (a face moves in a fifth of a second); the cold's teeth chatter on top, never eased
    const k = 1 - Math.exp(-10 * (dt || 0)); const Z = m.fz || (m.fz = Float32Array.from(T));
    for (let i = 0; i < NCH; i++) Z[i] += (T[i] - Z[i]) * k;
    F.set(Z);
    if (p.frio > 0.25) F[X.jaw] += 0.08 * Math.abs(Math.sin(Math.PI * 9.5 * t + id)) * Math.min(1, (p.frio - 0.25) * 2);
    // the speech: the mouth of a word (pose.talk: the talk clip's own channel), its vowels and its closings in turn
    const tk = pose.talk || 0;
    if (tk > 0.02) { const q = t * 6.5 + (id % 11) * 0.37, i0 = Math.floor(q), f = q - i0; const A = VIS[(G.hash(id * 7 + i0) * VIS.length) | 0], B = VIS[(G.hash(id * 7 + i0 + 1) * VIS.length) | 0]; const w = f * f * (3 - 2 * f);
      F[X.jaw] = Math.max(F[X.jaw], tk * (A[0] + (B[0] - A[0]) * w)); F[X.pucker] += tk * (A[1] + (B[1] - A[1]) * w); F[X.press] += tk * (A[2] + (B[2] - A[2]) * w); F[X.stretch] += tk * (A[3] + (B[3] - A[3]) * w); }
    // the chewing (pose.chew: the meal's clip's own channel): the jaw a little open and shut at the chew's pace, the lips pressed
    // between, the mouthful worked from side to side — mouth closed, never the vowels of a word
    const cw = pose.chew || 0;
    if (cw > 0.02) { const q = TAU * (t * 1.55 + (id % 13) * 0.071), o = 0.5 + 0.5 * Math.sin(q), op = o * o;
      F[X.jaw] = Math.max(F[X.jaw], cw * (0.04 + 0.2 * op)); F[X.press] += cw * 0.45 * (1 - op); F[X.pucker] += cw * 0.12 * op; F[X.smileSide] += cw * 0.16 * Math.sin(q * 0.5); }
    // the blink, the look — and the eyes a gesture keeps shut (the nap with the head on the arms: its clip's own word, eyes)
    const b = pose.blink === undefined ? 1 : pose.blink; F[X.blink] = Math.max(F[X.blink], (1 - b) / 0.88);
    const sh = a && ((a.over && a.ow > 0.5 && a.over.eyes) || (a.clip && a.clip.eyes)); if (sh === 'shut') F[X.blink] = Math.max(F[X.blink], 0.97);
    F[X.gazeX] = pose.gazeX || 0; F[X.gazeY] = pose.gazeY || 0;
    return RO.clamp(F);
  };
  const NOP = { velho: 0, crianca: 0, cansado: 0, frio: 0, calor: 0, chuva: 0, doente: 0, ferido: 0, manca: 0, gravida: 0, luto: 0, medo: 0, furia: 0, confia: 0, expans: 0, nobre: 0 };
  // the face: the blink (0 open .. 1 shut), where the eyes look (they go ahead of the head), the mouth — the numbers the skin paints
  // today (11 of them), from the channels of pose.face where the pose has them (the living face), else from the mood as before
  Anim.faceOf = function (pose, L) {
    const F = pose.face; if (F && RO && F.length === NCH) { const f = L.face || {};
      f.closed = F[X.blink]; f.gx = F[X.gazeX]; f.gy = F[X.gazeY]; f.mouth = F[X.jaw]; f.smile = F[X.smile]; f.up = F[X.browUp]; f.angry = F[X.browIn]; f.sad = F[X.browSad]; f.wide = F[X.wide]; f.squint = F[X.squint]; f.blush = F[X.blush];
      return f; }
    const f = L.face || {}; const b = pose.blink === undefined ? 1 : pose.blink; const md = L.mood || MOOD.calm;
    f.closed = G.clamp((1 - b) / 0.88, 0, 1); f.gx = G.clamp(pose.gazeX || 0, -0.45, 0.45); f.gy = G.clamp(pose.gazeY || 0, -0.3, 0.3);
    f.mouth = Math.max(pose.talk || 0, md.jaw || 0, (pose.chew || 0) * 0.08);
    f.smile = md.smile || 0; f.up = md.up || 0; f.angry = md.angry || 0; f.sad = md.sad || 0; f.wide = md.wide || 0; f.squint = md.squint || 0; f.blush = md.blush || 0;
    return f;
  };
  // (a blink: the lids down and up in a sixth of a second, every four seconds or so — each person on their own beat)
  Anim.blinkAt = function (t, id) { const q = (t + (id % 13) * 0.37) % (3.4 + (id % 5) * 0.3); return q < 0.16 ? 1 - Math.sin(q / 0.16 * Math.PI) * 0.92 : 1; };
})(window.G);
