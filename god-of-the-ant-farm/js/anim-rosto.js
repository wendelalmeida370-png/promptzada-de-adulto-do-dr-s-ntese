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

  // the face: the blink (0 open .. 1 shut), where the eyes look (they go ahead of the head), the mouth
  Anim.faceOf = function (pose, L) {
    const f = L.face || {}; const b = pose.blink === undefined ? 1 : pose.blink; const md = L.mood || MOOD.calm;
    f.closed = G.clamp((1 - b) / 0.88, 0, 1); f.gx = G.clamp(pose.gazeX || 0, -0.45, 0.45); f.gy = G.clamp(pose.gazeY || 0, -0.3, 0.3);
    f.mouth = Math.max(pose.talk || 0, md.jaw || 0);
    f.smile = md.smile || 0; f.up = md.up || 0; f.angry = md.angry || 0; f.sad = md.sad || 0; f.wide = md.wide || 0; f.squint = md.squint || 0; f.blush = md.blush || 0;
    return f;
  };
  // (a blink: the lids down and up in a sixth of a second, every four seconds or so — each person on their own beat)
  Anim.blinkAt = function (t, id) { const q = (t + (id % 13) * 0.37) % (3.4 + (id % 5) * 0.3); return q < 0.16 ? 1 - Math.sin(q / 0.16 * Math.PI) * 0.92 : 1; };
})(window.G);
