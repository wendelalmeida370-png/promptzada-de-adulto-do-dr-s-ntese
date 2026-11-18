'use strict';
// ============================================================
//  The gestures of daily life (22c, D-590 to D-604): clips of the
//  body's one animator (G.ANIM_CLIPS, JOGABILIDADE.md §4.6) for
//  what the people of the world do as they live — the prisoner
//  led with the hands joined. Only seen: nothing here reads
//  or writes the world (rule 113); what a gesture holds is the
//  inventory's (G.Inv.held: without the thing, the hands empty).
// ============================================================
(function (G) {
  // (each gesture and its mirror — the left-handed one's, `id~m`: Anim.mirrorDef, D-596)
  const K = (id, def) => { const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || []; Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  const ARMS = ['shLp', 'shLr', 'shLy', 'elL', 'gripL', 'wristL', 'shRp', 'shRr', 'shRy', 'elR', 'grip', 'wrist'];
  // (bound, walking: the hands held together before the belly, as tied — the head bowed — over the stride; the legs walk under
  // it, led — the act the world gives the prisoner taken to the cell: crime.js, 'bound'. The bonds are the inventory's: the cord
  // or the iron of the people that binds — G.Inv.held, D-612 —, the left hand on its ring: the thing's other hand, offW)
  K('bound-andar', { dur: 2, mask: ARMS.concat(['neck', 'offW']), in: 0.3, out: 0.35, events: { contact: 0.5 }, item: { hand: 'mao', two: true },
    keys: { shLp: [[0, -22], [1, -22]], shRp: [[0, -22], [1, -22]], shLr: [[0, -6], [1, -6]], shRr: [[0, 6], [1, 6]], elL: [[0, 64], [1, 64]], elR: [[0, 64], [1, 64]],
      grip: [[0, 0.6], [1, 0.6]], gripL: [[0, 0.6], [1, 0.6]], neck: [[0, 14], [0.5, 17], [1, 14]], offW: [[0, 1], [1, 1]] } });

  // ============================== the idle: the little things (22c fase 2, D-599) ==============================
  // Each one a clip of the arms, the head or the top, played over the stance as the idle's scheduler says (js/anim-ocio.js: its
  // moment on the world's clock, its time u). Built from the points of the body the hand reaches (Anim3D.REACH, D-597): the arm
  // from its rest to the point, a moment there — scratching, rubbing, fanning —, back to its rest. In degrees
  const D = 180 / Math.PI;
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0 };
  // (a hand at a point of the body: the right arm's — or the left's, mirrored — angles of Anim3D.REACH, plus a nudge)
  const at = (side, key, nudge) => { const q = (G.Anim3D && G.Anim3D.REACH && G.Anim3D.REACH[key]) || [0, 0, 0.2, 0]; const R = side > 0; const o = {};
    o[R ? 'shRp' : 'shLp'] = q[0] * D; o[R ? 'shRr' : 'shLr'] = (R ? q[1] : -q[1]) * D; o[R ? 'elR' : 'elL'] = q[2] * D; o[R ? 'shRy' : 'shLy'] = (R ? q[3] : -q[3]) * D;
    if (nudge) for (const j in nudge) o[j] = (o[j] !== undefined ? o[j] : REST[j] || 0) + nudge[j]; return o; };
  const mix = (...a) => Object.assign({}, ...a);
  // (keys from poses at times: each joint any pose names — where a pose does not name it, the last one that did, or the rest)
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  const RA = ['shRp', 'shRr', 'shRy', 'elR', 'grip', 'wrist'], LA = ['shLp', 'shLr', 'shLy', 'elL', 'gripL', 'wristL'], HD = ['neck', 'lookY', 'gazeX', 'headR'];
  const oc = (id, dur, mask, list, o) => K(id, Object.assign({ dur, loop: false, mask, in: 0.25, out: 0.3, events: { contact: 0.5 }, keys: keysOf(list) }, o || {}));
  const r0 = { shRp: REST.shRp, shRr: REST.shRr, elR: REST.elR, shRy: 0 }, l0 = { shLp: REST.shLp, shLr: REST.shLr, elL: REST.elL, shLy: 0 };
  // (a hand held at a point a while, worked there: the wobble of a scratch, a rub, a fan — n strokes of ± a on the joint j)
  const work = (side, key, j, a, n, nudge, extra) => { const P = at(side, key, nudge); const L = [[0, mix(side > 0 ? r0 : l0)], [0.22, mix(P, extra)]];
    for (let i = 1; i <= n; i++) L.push([0.22 + 0.56 * i / (n + 1), mix(P, extra, { [j]: P[j] + (i % 2 ? a : -a) })]); L.push([0.78, mix(P, extra)], [1, mix(side > 0 ? r0 : l0)]); return L; };
  const both = (L1, L2) => L1.map(([u, p], i) => [u, mix(p, L2[i] ? L2[i][1] : {})]);
  // the head: a look round, at the ground, at the sky, at the way someone will come by, a nod to someone known
  oc('oc-olhar-volta', 3.2, HD, [[0, { lookY: 0, neck: 0 }], [0.25, { lookY: 32, neck: -2 }], [0.45, { lookY: 30, neck: -3 }], [0.7, { lookY: -28, neck: -1 }], [0.85, { lookY: -26 }], [1, { lookY: 0, neck: 0 }]]);
  oc('oc-olhar-chao', 2.4, HD, [[0, { neck: 0 }], [0.3, { neck: 26, lookY: 6 }], [0.75, { neck: 24, lookY: -4 }], [1, { neck: 0, lookY: 0 }]]);
  oc('oc-olhar-ceu', 2.6, HD, [[0, { neck: 0 }], [0.3, { neck: -28, lookY: 4 }], [0.75, { neck: -26, lookY: 10 }], [1, { neck: 0, lookY: 0 }]]);
  oc('oc-olhar-porta', 3.5, HD, [[0, { lookY: 0 }], [0.2, { lookY: 48, neck: -4 }], [0.85, { lookY: 46, neck: -3 }], [1, { lookY: 0, neck: 0 }]]);
  oc('oc-acenar-cabeca', 1.2, HD, [[0, { neck: 0 }], [0.3, { neck: 16 }], [0.55, { neck: 2 }], [0.75, { neck: 10 }], [1, { neck: 0 }]], { in: 0.15, out: 0.2 });
  // the hand to the head, the nape, the arm, the chin, the hair: scratches and touches (the head goes to the hand a little)
  oc('oc-cocar-cabeca', 2.4, RA.concat(HD), work(1, 'cabeca', 'elR', 9, 4, { shRp: 20 }, { neck: 8, grip: 0.45 }));
  oc('oc-cocar-nuca', 2.2, RA.concat(HD), work(1, 'nuca', 'shRy', 8, 4, null, { neck: 12, grip: 0.4 }));
  oc('oc-cocar-braco', 2.4, RA, work(1, 'ombro', 'elR', 8, 4, { elR: 6 }, { grip: 0.35 }));
  oc('oc-cocar-queixo', 2.8, RA.concat(HD), work(1, 'boca', 'elR', 4, 2, { elR: -6, shRp: 4 }, { neck: -4, grip: 0.55 }));
  oc('oc-ajeitar-cabelo', 1.8, RA.concat(HD), [[0, r0], [0.3, mix(at(1, 'testa', { shRp: 10 }), { neck: 4 })], [0.6, mix(at(1, 'cabeca', { shRp: 20 }), { neck: -2 })], [1, mix(r0, { neck: 0 })]]);
  // the hands at the belt, the clothes; on the hips, behind the back, joined before the body
  oc('oc-ajeitar-cinto', 1.6, RA.concat(LA), both(work(1, 'juntas', 'elR', 6, 2, { shRy: -12 }, { grip: 0.8 }), work(-1, 'juntas', 'elL', 6, 2, { shLy: 12 }, { gripL: 0.8 })));
  oc('oc-ajeitar-roupa', 1.8, RA.concat(LA), both(work(1, 'barriga', 'shRp', 7, 2, { shRy: -18 }, { grip: 0.7 }), work(-1, 'barriga', 'shLp', 7, 2, { shLy: 18 }, { gripL: 0.7 })));
  // (the arms folded across the chest — each hand at the other arm, the right forearm over the left: the hands on the hips themselves
  // go inside a cape and the belly, T-1613; the reach of the side of the belly turned out, less far back and less bent)
  const AK = { shRr: -20, shRp: -25, elR: -10 }, AKL = { shLr: 20, shLp: -15, elL: -10 };
  oc('oc-bracos-cruzados', 4, RA.concat(LA), [[0, mix(r0, l0)], [0.2, mix(at(1, 'ladoBarriga', AK), at(-1, 'ladoBarriga', AKL))], [0.85, mix(at(1, 'ladoBarriga', mix(AK, { elR: AK.elR + 3 })), at(-1, 'ladoBarriga', mix(AKL, { elL: AKL.elL + 3 })))], [1, mix(r0, l0)]]);
  // (the hands on the hips — of who wears nothing over the arms that the open elbows would pierce, no cape, no toga, no long skirt:
  // in the arms-crossed moment, one person in two by the id, Anim3D.ocioClip —: the palms at the sides of the waist, the elbows out
  // and back — the angles the rig's own arm reach finds, P3.armIK: T-1618, D-613)
  const HIP = { shRp: 55.6, shRr: -11, elR: 112.4, shRy: 42.9 }, HIPL = { shLp: 55.6, shLr: 11, elL: 112.4, shLy: -42.9 };
  oc('oc-maos-cintura', 4, RA.concat(LA), [[0, mix(r0, l0)], [0.2, mix(HIP, HIPL, { grip: 0.35, gripL: 0.35 })], [0.85, mix(HIP, HIPL, { shRp: 57, shLp: 57, grip: 0.35, gripL: 0.35 })], [1, mix(r0, l0)]]);
  oc('oc-maos-costas', 4, RA.concat(LA), [[0, mix(r0, l0)], [0.22, mix(at(1, 'costas'), at(-1, 'costas'))], [0.85, mix(at(1, 'costas'), at(-1, 'costas'))], [1, mix(r0, l0)]]);
  oc('oc-maos-juntas', 3.6, RA.concat(LA), [[0, mix(r0, l0)], [0.22, mix(at(1, 'juntas'), at(-1, 'juntas'), { grip: 0.5, gripL: 0.5 })], [0.85, mix(at(1, 'juntas'), at(-1, 'juntas'), { grip: 0.5, gripL: 0.5 })], [1, mix(r0, l0)]]);
  // the tired: a stretch, a yawn, a sigh, the breath caught bent over
  // (the stretch leans back 3 to 4°: at 5 the bronze cuirass's foot rose over the hip by 4 mm — L-1776)
  oc('oc-espreguicar', 3, RA.concat(LA, HD, ['lean']), [[0, mix(r0, l0, { lean: 0 })], [0.35, mix(at(1, 'alto'), at(-1, 'alto'), { lean: -3, neck: -12, grip: 0.7, gripL: 0.7 })], [0.62, mix(at(1, 'alto', { shRr: -8 }), at(-1, 'alto', { shLr: 8 }), { lean: -4, neck: -14 })], [1, mix(r0, l0, { lean: 0, neck: 0 })]], { in: 0.3, out: 0.4 });
  oc('oc-bocejar', 2.4, RA.concat(HD), [[0, mix(r0, { neck: 0 })], [0.3, mix(at(1, 'boca'), { neck: -10 })], [0.7, mix(at(1, 'boca'), { neck: -8 })], [1, mix(r0, { neck: 0 })]]);
  oc('oc-suspirar', 2.4, ['lean', 'neck', 'breath', 'shLr', 'shRr'], [[0, { lean: 0, neck: 0, breath: 0, shLr: REST.shLr, shRr: REST.shRr }], [0.35, { lean: 3, neck: -4, breath: 0.9 }], [0.65, { lean: 7, neck: 13, breath: -0.6, shLr: 1, shRr: -1 }], [1, { lean: 0, neck: 0, breath: 0, shLr: REST.shLr, shRr: REST.shRr }]]);
  oc('oc-arquejar', 2.6, RA.concat(LA, HD, ['lean', 'breath']), [[0, mix(r0, l0, { lean: 0, breath: 0 })], [0.3, mix({ shRp: -32, shRr: 4, elR: 12, shLp: -32, shLr: -4, elL: 12 }, { lean: 28, neck: -12, breath: 1 })], [0.55, { lean: 29, neck: -12, breath: -1 }], [0.8, mix({ shRp: -30, shRr: 4, elR: 14, shLp: -30, shLr: -4, elL: 14 }, { lean: 27, neck: -10, breath: 1 })], [1, mix(r0, l0, { lean: 0, neck: 0, breath: 0 })]]);
  // the cold: the hands rubbed, blown on; the heat: the face fanned, the brow wiped
  oc('oc-esfregar-maos', 2.6, RA.concat(LA, HD), both(work(1, 'barriga', 'shRy', 10, 6, { shRp: -10, elR: 10 }, { grip: 0.3, neck: 6 }), work(-1, 'barriga', 'shLy', -10, 6, { shLp: -10, elL: 10 }, { gripL: 0.3 })));
  oc('oc-soprar-maos', 2.4, RA.concat(LA, HD), [[0, mix(r0, l0)], [0.28, mix(at(1, 'boca', { elR: -4 }), at(-1, 'boca', { elL: -4 }), { grip: 0.5, gripL: 0.5, neck: 8 })], [0.75, mix(at(1, 'boca', { elR: -4 }), at(-1, 'boca', { elL: -4 }), { neck: 9 })], [1, mix(r0, l0, { neck: 0 })]]);
  oc('oc-abanar-se', 2.6, RA.concat(HD), work(1, 'rosto', 'shRy', 18, 8, { elR: -28, shRp: 2 }, { grip: 0.05, neck: -6 }));
  oc('oc-enxugar-testa', 1.8, RA.concat(HD), [[0, r0], [0.35, mix(at(1, 'testa'), { neck: -4 })], [0.62, mix(at(1, 'testa', { shRy: -36, shRr: -10 }), { neck: -2 })], [1, mix(r0, { neck: 0 })]]);
  // the sick: a cough, a hand to the chest; the grieving: the eyes wiped
  oc('oc-tossir', 1.8, RA.concat(HD, ['lean']), [[0, mix(r0, { lean: 0, neck: 0 })], [0.25, mix(at(1, 'boca'), { lean: 4, neck: 6 })], [0.35, { lean: 12, neck: 12 }], [0.45, { lean: 5, neck: 6 }], [0.55, { lean: 12, neck: 12 }], [0.75, mix(at(1, 'boca'), { lean: 4, neck: 6 })], [1, mix(r0, { lean: 0, neck: 0 })]], { in: 0.18 });
  // (the sneeze: the breath drawn in, the head thrown back, then down hard into the hand — the sound at the throw, 0.45)
  oc('oc-espirrar', 1.6, RA.concat(HD, ['lean']), [[0, mix(r0, { lean: 0, neck: 0 })], [0.25, mix(at(1, 'boca', { elR: -6 }), { lean: -4, neck: -14 })], [0.42, mix(at(1, 'boca'), { lean: 14, neck: 22 })], [0.55, mix(at(1, 'boca'), { lean: 8, neck: 12 })], [1, mix(r0, { lean: 0, neck: 0 })]]);
  oc('oc-mao-peito', 2.6, RA, [[0, r0], [0.25, mix(at(1, 'peito'), { grip: 0.3 })], [0.8, mix(at(1, 'peito'), { grip: 0.35 })], [1, r0]]);
  oc('oc-enxugar-olhos', 2.2, RA.concat(HD), [[0, mix(r0, { neck: 0 })], [0.35, mix(at(1, 'olhos'), { neck: 12, grip: 0.4 })], [0.6, mix(at(1, 'olhos', { shRy: -8 }), { neck: 13 })], [1, mix(r0, { neck: 0 })]]);
  // the wait: the fingers drummed at the hip; the child to come: the belly stroked
  oc('oc-tamborilar', 3, RA, [[0, r0]].concat([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map((u, i) => [u, mix(at(1, 'cintura'), { grip: i % 2 ? 0.85 : 0.2 })]), [[1, r0]]));
  oc('oc-afagar-barriga', 3.2, RA, work(1, 'barriga', 'shRy', 7, 4, { shRp: 4 }, { grip: 0.1 }));
  // the drunk: a hiccup, the arms out for a balance that is late
  oc('oc-solucar', 1.4, ['lean', 'neck', 'shLr', 'shRr'], [[0, { lean: 0, neck: 0, shLr: REST.shLr, shRr: REST.shRr }], [0.3, { lean: -5, neck: -10, shLr: 9, shRr: -9 }], [0.42, { lean: 0, neck: 0, shLr: REST.shLr, shRr: REST.shRr }], [0.65, { lean: -5, neck: -10, shLr: 9, shRr: -9 }], [0.8, { lean: 0, neck: 0, shLr: REST.shLr, shRr: REST.shRr }], [1, { lean: 0, neck: 0, shLr: REST.shLr, shRr: REST.shRr }]], { in: 0.1, out: 0.2 });
  oc('oc-apoiar', 2.8, RA.concat(LA), [[0, mix(r0, l0)], [0.3, { shLr: 34, shRr: -34, elL: 22, elR: 22, shLp: -6, shRp: -6 }], [0.55, { shLr: 26, shRr: -38, elL: 18, elR: 26 }], [0.8, { shLr: 36, shRr: -28, elL: 24, elR: 18 }], [1, mix(r0, l0)]], { in: 0.3, out: 0.45 });
  // someone known or of renown passing: a point, a wave
  oc('oc-apontar', 2.0, RA.concat(HD), [[0, mix(r0, { lookY: 0 })], [0.25, { shRp: -80, shRr: -8, elR: 6, shRy: 0, grip: 0.7, lookY: 4 }], [0.75, { shRp: -78, shRr: -6, elR: 8, shRy: 0, grip: 0.7, lookY: 4 }], [1, mix(r0, { lookY: 0 })]]);
  oc('oc-acenar', 1.6, RA, [[0, r0], [0.18, { shRp: -140, shRr: -30, elR: 30, shRy: 0, grip: 0.1 }], [0.34, { shRr: -46 }], [0.5, { shRr: -26 }], [0.66, { shRr: -46 }], [0.82, { shRp: -140, shRr: -30, elR: 30 }], [1, r0]], { in: 0.15 });
})(window.G);
