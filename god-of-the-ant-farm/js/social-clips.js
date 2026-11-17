'use strict';
// ============================================================
//  The acts between people and of the crowd (22c fase 3, D-602,
//  D-603): a pose for every act the world gives that fell to the
//  plain stance — the cheer and the boo of the crowd at the
//  gallows, the riot's fists, the scream, the condemned writhing,
//  the shove, the one who hides, the guard at the post, the herder,
//  the crank and the press, the rope pulled, the lantern held up,
//  the hand that shades the eyes, the one who lurks or waits, the
//  actor declaiming — and those converted with a loss made again:
//  the weeping on the knees, the cower, the begging, the sick one
//  bent, the joy, the shout, the shrug, the drink, the serving,
//  the selling, the story told seated. And for every act of the
//  society's vocabulary (G.SocAtos) its family's pose at least —
//  the meeting, the talk, the affection, the conflict, the family,
//  the feast, the asking, the respect, alone, the crime; the acts
//  of two posed alone for now (the pair's choreography: wave 2).
//  Only seen (rule 113): clips of the one animator; what a hand
//  holds is the inventory's — without the thing, the hand empty.
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => { Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef && !def.noMirror) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  const D = 180 / Math.PI;
  const REST = { shRp: 2.3, shRr: -5.2, elR: 11.5, shRy: 0, shLp: 2.3, shLr: 5.2, elL: 10.3, shLy: 0, grip: 0.15, gripL: 0.15, neck: 0, lookY: 0, lean: 0, twist: 0, headR: 0, tilt: 0, talk: 0,
    crouch: 0, hipL: 0, hipR: 0, knL: 3, knR: 3, anL: 0, anR: 0 };
  // (a hand at a point of the body — Anim3D.REACH, D-597 —, the right's or the left's mirrored, with a nudge)
  const at = (side, key, nudge) => { const q = (G.Anim3D && G.Anim3D.REACH && G.Anim3D.REACH[key]) || [0, 0, 0.2, 0]; const R = side > 0; const o = {};
    o[R ? 'shRp' : 'shLp'] = q[0] * D; o[R ? 'shRr' : 'shLr'] = (R ? q[1] : -q[1]) * D; o[R ? 'elR' : 'elL'] = q[2] * D; o[R ? 'shRy' : 'shLy'] = (R ? q[3] : -q[3]) * D;
    if (nudge) for (const j in nudge) o[j] = (o[j] !== undefined ? o[j] : REST[j] || 0) + nudge[j]; return o; };
  const mix = (...a) => Object.assign({}, ...a);
  // (keys from poses at times: where a pose does not name a joint, the last that did, or the rest)
  function keysOf(list) { const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j); const out = {};
    for (const j of J) { let last = REST[j] !== undefined ? REST[j] : 0; out[j] = list.map(([u, p]) => { if (p[j] !== undefined) last = p[j]; return [u, last]; }); } return out; }
  // (a loop through poses, back to its first)
  const loopOf = (...poses) => poses.map((p, i) => [i / poses.length, p]).concat([[1, poses[0]]]);
  const U = 'upper', ARMS = 'arms';
  const c = (id, dur, mask, list, o) => K(id, Object.assign({ dur, mask, in: 0.3, out: 0.35, events: { contact: 0.5 }, keys: keysOf(list) }, o || {}));
  // the legs of kneeling (the prayer's, the feet stretched back), of one knee down (the knife at the hide's)
  const KNEEL = { crouch: 0.45, hipL: -6, hipR: -6, knL: 95, knR: 95, anL: 70, anR: 70 }; // (the feet stretched back, the instep on the ground — the toes of the prayer's own dig in: T-1615)
  const ONEKNEE = { crouch: 0.5, hipL: -95, knL: 110, hipR: 10, knR: 115, anR: -30, anL: 0 };
  // (some gestures only on their own side: the drape of a toga and of a cape over one shoulder is not the mirror of itself — noMirror)
  const FULL = { mask: 'full', feet: 'free', base: 'idle', in: 0.45, out: 0.45 };

  // ============================== the families of the society's acts (the least pose of every act) ==============================
  c('fam-encontro', 2.4, U, loopOf({ shRp: -62, shRr: -22, elR: 70, grip: 0.1, neck: 4 }, { shRp: -64, shRr: -32, elR: 66, neck: 8 }, { shRp: -62, shRr: -20, elR: 72, neck: 2 }));
  c('fam-conversa', 4, U, loopOf(mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 6, headR: 6 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 12, headR: 8 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 4, headR: 4 })), { acts: ['heed'] });
  c('fam-afeto', 3, U, loopOf({ shLp: -68, shRp: -68, shLr: -18, shRr: 18, elL: 52, elR: 52, lean: 6, neck: 6 }, { shLp: -70, shRp: -70, shLr: -22, shRr: 22, elL: 56, elR: 56, lean: 7, neck: 8 }), { acts: ['kiss', 'console', 'carried'] });
  c('fam-conflito', 1.6, U, loopOf({ shRp: -88, shRr: -12, elR: 105, grip: 1, gripL: 1, shLp: -20, elL: 60, lean: 8, neck: -4 }, { shRp: -96, shRr: -20, elR: 98, lean: 10, neck: -6 }, { shRp: -84, shRr: -6, elR: 108, lean: 7 }), { acts: ['separate'] });
  c('fam-familia', 1.8, U, loopOf(mix({ shRp: -70, shRr: -6, elR: 42, grip: 0.7, neck: 6, lean: 6 }, at(-1, 'cintura')), mix({ shRp: -74, shRr: -14, elR: 36 }, at(-1, 'cintura')), mix({ shRp: -70, shRr: 2, elR: 42 }, at(-1, 'cintura'))), { acts: ['scold'] });
  c('fam-festa', 1.6, U, loopOf({ shLp: -150, shRp: -150, shLr: 22, shRr: -22, elL: 30, elR: 30, grip: 0.8, gripL: 0.8, neck: -10 }, { shLp: -160, shRp: -142, shLr: 28, shRr: -16, elL: 22, elR: 36, neck: -12 }, { shLp: -142, shRp: -160, shLr: 16, shRr: -28, elL: 36, elR: 22, neck: -10 }), { acts: ['cheer', 'celebrate', 'dancepair'] });
  c('fam-pedido', 3, U, loopOf({ shLp: -42, shRp: -42, shLr: -8, shRr: 8, elL: 62, elR: 62, lean: 10, neck: 6, grip: 0.05, gripL: 0.05 }, { shLp: -46, shRp: -46, elL: 58, elR: 58, lean: 12, neck: 8 }), { acts: ['ask', 'offer', 'help', 'helped'] });
  c('fam-respeito', 3, U, [[0, mix(at(1, 'juntas'), at(-1, 'juntas'), { lean: 0 })], [0.3, mix(at(1, 'juntas'), at(-1, 'juntas'), { lean: 32, neck: 22 })], [0.7, mix(at(1, 'juntas'), at(-1, 'juntas'), { lean: 32, neck: 22 })], [1, mix(at(1, 'juntas'), at(-1, 'juntas'), { lean: 0, neck: 0 })]], { acts: ['bow'] });
  c('fam-sozinho', 6, U, loopOf(mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 8, lookY: -18 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 4, lookY: 0 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 8, lookY: 18 })), { acts: ['contemplate'] });
  c('fam-crime', 3, U, loopOf(mix(at(1, 'juntas'), at(-1, 'juntas'), { grip: 0.6, gripL: 0.6, neck: 18, lookY: -12 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 16, lookY: 14 })), { acts: ['shackle'] });

  // ============================== the crowd at the gallows, the riot, the scream ==============================
  c('ato-vaia', 1.2, U, loopOf({ shRp: -110, shRr: -18, elR: 95, grip: 1, shLp: -10, elL: 30, gripL: 1, lean: 6, neck: -6 }, { shRp: -118, shRr: -26, elR: 88, lean: 8, neck: -8 }), { acts: ['boo', 'threaten'] });
  c('ato-motim', 1.1, U, loopOf({ shRp: -165, shRr: -12, elR: 20, grip: 1, shLp: -40, shLr: 10, elL: 90, gripL: 1, neck: -12 }, { shRp: -120, shRr: -8, elR: 70, shLp: -165, shLr: 12, elL: 20, neck: -10 }), { acts: ['riot'] });
  c('ato-gritar', 1.8, U, loopOf({ shLp: -60, shRp: -60, shLr: 48, shRr: -48, elL: 30, elR: 30, neck: -22, lean: -3, grip: 0.9, gripL: 0.9 }, { shLp: -66, shRp: -66, shLr: 54, shRr: -54, elL: 26, elR: 26, neck: -26, lean: -4 }), { acts: ['scream'] });
  c('ato-condenado', 2.2, 'full', loopOf(mix(KNEEL, { shLp: 30, shRp: 30, shLr: -8, shRr: 8, elL: 60, elR: 60, twist: -8, lean: 8, neck: 20 }), mix(KNEEL, { twist: 8, lean: 12, neck: 10 }), mix(KNEEL, { twist: -4, lean: 6, neck: 24 })), Object.assign({}, FULL, { acts: ['writhe'] }));
  c('ato-debater', 1.4, U, loopOf({ shLp: -40, shRp: -40, shLr: 10, shRr: -10, elL: 90, elR: 90, grip: 1, gripL: 1, lean: -3, twist: -10 }, { shLp: -20, shRp: -20, shLr: 12, shRr: -12, elL: 110, elR: 110, lean: -4, twist: 10 }), { acts: ['struggle'] });
  c('ato-empurrar', 1.0, U, [[0, { shLp: -40, shRp: -40, shLr: -6, shRr: 6, elL: 100, elR: 100, lean: 0, grip: 0.1, gripL: 0.1 }], [0.4, { shLp: -82, shRp: -82, elL: 18, elR: 18, lean: 18 }], [0.6, { shLp: -80, shRp: -80, elL: 22, elR: 22, lean: 14 }], [1, { shLp: -40, shRp: -40, elL: 100, elR: 100, lean: 0 }]], { loop: false, events: { contact: 0.4 }, acts: ['shove'] });
  c('ato-esconder', 2.4, 'full', loopOf(mix(ONEKNEE, at(1, 'cabeca'), at(-1, 'cabeca'), { lean: 30, neck: 30 }), mix(ONEKNEE, at(1, 'cabeca', { elR: 4 }), at(-1, 'cabeca', { elL: 4 }), { lean: 32, neck: 32 })), Object.assign({}, FULL, { acts: ['hide', 'cower'] }));
  c('ato-alcancar', 2, U, loopOf({ shRp: -132, shRr: -10, elR: 10, grip: 0.3, lean: -4, neck: -14 }, { shRp: -138, shRr: -14, elR: 6, grip: 0.6, neck: -16 }), { acts: ['reach'] });
  c('ato-tocha-frente', 3, ARMS, loopOf({ shRp: -96, shRr: -8, elR: 26, grip: 1 }, { shRp: -98, shRr: -10, elR: 24, grip: 1 }), { acts: ['torchfwd'] });
  c('ato-lanterna', 3, ARMS, loopOf({ shRp: -78, shRr: -14, elR: 40, grip: 1 }, { shRp: -80, shRr: -16, elR: 38, grip: 1 }), { acts: ['lantern'] });
  c('ato-desmascarar', 1.6, U, [[0, mix(at(1, 'olhos'), at(-1, 'olhos'), { grip: 0.7, gripL: 0.7 })], [0.35, mix(at(1, 'olhos'), at(-1, 'olhos'))], [0.7, mix(at(1, 'peito'), at(-1, 'peito'), { neck: -6 })], [1, mix(at(1, 'barriga'), at(-1, 'barriga'), { neck: 0 })]], { loop: false, acts: ['unmask'], noMirror: true });
  c('ato-rito', 5, U, loopOf({ shLp: -140, shRp: -140, shLr: 30, shRr: -30, elL: 20, elR: 20, neck: -24, lean: -3, gripL: 0.05, grip: 0.05 }, { shLp: -150, shRp: -150, shLr: 34, shRr: -34, elL: 16, elR: 16, neck: -28, lean: -4 }), { acts: ['rite'] });
  // ============================== the posts and the trades that stood still ==============================
  c('posto', 6, U, loopOf(mix(at(-1, 'cintura'), { shRp: -10, shRr: -6, elR: 30, grip: 0.8, lookY: -36, neck: -2 }), mix(at(-1, 'cintura'), { lookY: 0, neck: 0 }), mix(at(-1, 'cintura'), { lookY: 36, neck: -2 }), mix(at(-1, 'cintura'), { lookY: 0 })), { acts: ['guard'] });
  c('ato-pastorear', 2.6, U, loopOf({ shRp: -55, shRr: -30, elR: 30, grip: 0.9, lean: 6, lookY: -10 }, { shRp: -60, shRr: -60, elR: 26, lookY: 10 }, { shRp: -52, shRr: -20, elR: 34, lookY: 0 }), { acts: ['herd'] });
  c('ato-manivela', 1.6, U, loopOf({ shRp: -40, shLp: -40, shRr: 8, shLr: -8, elR: 70, elL: 70, grip: 1, gripL: 1, lean: 12 }, { shRp: -58, shLp: -58, elR: 50, elL: 50, lean: 14 }, { shRp: -44, shLp: -44, elR: 90, elL: 90, lean: 12 }, { shRp: -28, shLp: -28, elR: 80, elL: 80, lean: 10 }), { acts: ['crank'] });
  c('ato-prensar', 1.8, U, loopOf({ shRp: -55, shLp: -55, shRr: 6, shLr: -6, elR: 60, elL: 60, grip: 0.9, gripL: 0.9, lean: 18 }, { shRp: -40, shLp: -40, elR: 30, elL: 30, lean: 30 }), { acts: ['press'] });
  c('ato-puxar', 1.6, U, loopOf({ shRp: -72, shLp: -66, shRr: 4, shLr: -4, elR: 22, elL: 26, grip: 1, gripL: 1, lean: -2 }, { shRp: -36, shLp: -32, elR: 90, elL: 94, lean: -3 }), { acts: ['pull'] });
  c('ato-escovar', 1.4, U, loopOf({ shRp: -58, shRr: -10, elR: 50, grip: 0.9, lean: 10, shLp: -30, elL: 40 }, { shRp: -62, shRr: -36, elR: 46, lean: 12 }), { acts: ['groom'] });
  c('ato-olhar-longe', 4, U, loopOf(mix(at(1, 'testa', { shRp: 10 }), { neck: -8, lookY: -20 }), mix(at(1, 'testa', { shRp: 10 }), { neck: -10, lookY: 20 })), { acts: ['look'], noMirror: true });
  c('ato-espreitar', 3, 'full', loopOf({ crouch: 0.12, hipL: -24, hipR: -18, knL: 30, knR: 26, anL: -4, anR: -4, lean: 22, neck: -14, shLp: -30, shRp: -30, shLr: -6, shRr: 6, elL: 70, elR: 70, lookY: -20 }, { crouch: 0.12, hipL: -24, hipR: -18, knL: 30, knR: 26, lean: 22, neck: -14, lookY: 20 }), { mask: 'full', feet: 'plant', stance: [0.15, 0.06, -0.04], in: 0.4, out: 0.4, acts: ['lurk'] });
  c('ato-esperar', 5, U, loopOf(mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 2, lookY: -14 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 6, lookY: 10 }), mix(at(1, 'juntas'), at(-1, 'juntas'), { neck: 0, lookY: 30 })), { acts: ['wait'] });
  c('ato-enforcado', 4, 'full', loopOf({ shLp: 6, shRp: 6, shLr: 4, shRr: -4, elL: 6, elR: 6, neck: 40, headR: 18, grip: 0, gripL: 0, knL: 8, knR: 12, anL: 30, anR: 34 }, { neck: 42, headR: 20, knL: 10, knR: 10 }), Object.assign({}, FULL, { acts: ['hangd'], noMirror: true }));
  c('ato-atuar', 3.2, U, loopOf(mix({ shRp: -120, shRr: -40, elR: 20, grip: 0.1, neck: -12, talk: 0.6 }, at(-1, 'peito')), mix({ shRp: -100, shRr: -60, elR: 30, neck: -8, talk: 0.3 }, at(-1, 'peito')), mix({ shRp: -130, shRr: -30, elR: 16, neck: -14, talk: 0.7 }, at(-1, 'peito'))), { acts: ['act', 'sing'] });
  // ============================== the acts converted with a loss, made again ==============================
  c('ato-chorar-joelhos', 3, 'full', loopOf(mix(KNEEL, at(1, 'olhos'), at(-1, 'olhos'), { lean: 12, neck: 22 }), mix(KNEEL, at(1, 'olhos', { elR: 3 }), at(-1, 'olhos', { elL: 3 }), { lean: 15, neck: 25 })), Object.assign({}, FULL, { acts: ['weepk'] }));
  c('ato-implorar', 2.6, 'full', loopOf(mix(KNEEL, { shLp: -70, shRp: -70, shLr: -12, shRr: 12, elL: 60, elR: 60, lean: 10, neck: -10, grip: 0.05, gripL: 0.05 }), mix(KNEEL, { shLp: -80, shRp: -80, elL: 50, elR: 50, lean: 14, neck: -6 })), Object.assign({}, FULL, { acts: ['beg', 'plead'] }));
  c('ato-propor', 3, 'full', loopOf(mix(ONEKNEE, { shRp: -60, shRr: -8, elR: 50, grip: 0.3, shLp: -20, elL: 30, neck: -8, lean: 6 }), mix(ONEKNEE, { shRp: -64, elR: 46, neck: -10 })), Object.assign({}, FULL, { acts: ['propose'] }));
  c('ato-doente', 3, U, loopOf(mix(at(1, 'barriga'), { shLp: -24, shLr: 9, elL: 30, lean: 9, neck: 16 }), mix(at(1, 'barriga', { shRy: 6 }), { lean: 11, neck: 20 })), { acts: ['sick'] });
  c('ato-alegria', 1.2, U, loopOf({ shLp: -150, shRp: -130, shLr: 24, shRr: -18, elL: 26, elR: 40, grip: 0.6, gripL: 0.6, neck: -10, twist: 8 }, { shLp: -130, shRp: -150, shLr: 18, shRr: -24, elL: 40, elR: 26, neck: -12, twist: -8 }), { acts: ['joy'] });
  c('ato-gritar-maos', 1.6, U, loopOf(mix(at(1, 'boca'), at(-1, 'boca'), { neck: -8, talk: 0.8 }), mix(at(1, 'boca', { elR: -3 }), at(-1, 'boca', { elL: -3 }), { neck: -10, talk: 0.6 })), { takes: ['shout'] });
  c('ato-duvidar', 1.8, U, [[0, mix({ shLp: -16, shRp: -16, shLr: 22, shRr: -22, elL: 88, elR: 88, headR: 0 })], [0.35, { shLp: -20, shRp: -20, shLr: 28, shRr: -28, elL: 92, elR: 92, headR: 12, neck: -4 }], [0.7, { shLp: -18, shRp: -18, shLr: 26, shRr: -26, elL: 90, elR: 90, headR: 10 }], [1, { shLp: -16, shRp: -16, shLr: 22, shRr: -22, elL: 88, elR: 88, headR: 0, neck: 0 }]], { takes: ['question', 'disagree', 'refuse'] });
  c('ato-beber', 2.6, U, [[0, mix(at(1, 'barriga', { elR: -20 }), at(-1, 'barriga'), { grip: 0.8, neck: 0 })], [0.3, mix(at(1, 'boca'), at(-1, 'barriga'), { neck: -14 })], [0.55, mix(at(1, 'boca', { shRp: -6 }), at(-1, 'barriga'), { neck: -18 })], [0.8, mix(at(1, 'barriga', { elR: -20 }), at(-1, 'barriga'), { neck: 0 })], [1, mix(at(1, 'barriga', { elR: -20 }), at(-1, 'barriga'), { neck: 0 })]], { acts: ['drink', 'toast'] });
  c('ato-servir', 2, U, loopOf({ shRp: -62, shRr: -8, elR: 38, grip: 0.7, lean: 8, neck: 8 }, { shRp: -40, shRr: -6, elR: 60, lean: 4, neck: 4 }), { takes: ['serve'] });
  c('ato-vender', 3, U, loopOf({ shRp: -46, shRr: -34, elR: 50, grip: 0.1, shLp: -30, shLr: 10, elL: 60, talk: 0.6, twist: -8 }, { shRp: -54, shRr: -48, elR: 40, talk: 0.2, twist: -12 }, { shRp: -40, shRr: -20, elR: 60, talk: 0.7, twist: -4 }), { takes: ['sell'] });
  c('ato-contar', 4, U, loopOf({ shLp: -40, shRp: -40, shLr: 10, shRr: -10, elL: 70, elR: 70, talk: 0.6, neck: 4 }, { shLp: -56, shRp: -34, shLr: 24, shRr: -6, elL: 56, elR: 80, talk: 0.2, neck: 0 }, { shLp: -34, shRp: -56, shLr: 6, shRr: -24, elL: 80, elR: 56, talk: 0.7, neck: 6 }), { base: 'sit', feet: 'free', acts: ['story'] });
  // (the child at play between two runs: the arms swinging loose, the head turning to the others, a little hop of the shoulders)
  c('brincar', 1.4, U, loopOf({ shLp: -30, shRp: 20, shLr: 24, shRr: -24, elL: 40, elR: 30, lean: -4, neck: -8, lookY: -16, twist: 10 }, { shLp: 20, shRp: -30, shLr: 24, shRr: -24, elL: 30, elR: 40, lean: 2, neck: -4, lookY: 16, twist: -10 }));
  // ============================== the society's own acts, posed alone for now ==============================
  c('soc-cumprimentar', 1.6, U, [[0, { shRp: -10, shRr: -6, elR: 20 }], [0.25, { shRp: -128, shRr: -26, elR: 36, grip: 0.1, neck: 6 }], [0.45, { shRr: -40 }], [0.6, { shRr: -24 }], [0.8, { shRp: -128, shRr: -30, elR: 36 }], [1, { shRp: -10, shRr: -6, elR: 20, neck: 0 }]], { loop: false, acts: ['greet', 'farewell'] });
  c('soc-acenar-cabeca', 1.2, ['neck', 'lookY', 'headR'], [[0, { neck: 0 }], [0.3, { neck: 16 }], [0.55, { neck: 2 }], [0.75, { neck: 10 }], [1, { neck: 0 }]], { loop: false, acts: ['nod', 'agree', 'accept'] });
  c('soc-saudar', 1.6, U, [[0, { shRp: -10, shRr: -6, elR: 20 }], [0.3, mix(at(1, 'testa', { shRp: -4, elR: -14 }), { neck: -4 })], [0.75, mix(at(1, 'testa', { shRp: -4, elR: -14 }), { neck: -4 })], [1, { shRp: -10, shRr: -6, elR: 20, shRy: 0, neck: 0 }]], { loop: false, acts: ['salute'] });
  c('soc-ouvir', 4, ['neck', 'lookY', 'headR', 'lean'], loopOf({ neck: 6, headR: 6, lean: 3 }, { neck: 12, headR: 8, lean: 4 }, { neck: 4, headR: 2, lean: 2 }), { takes: ['listen'] });
  c('soc-rir', 1.4, U, loopOf(mix(at(1, 'barriga', { elR: -8 }), { lean: -4, neck: -16, twist: 4 }), mix(at(1, 'barriga', { elR: -4 }), { lean: 6, neck: 4, twist: -4 })), { acts: ['laugh'] });
  c('soc-cochichar', 3, U, loopOf(mix(at(1, 'boca', { elR: -16, shRr: -12 }), { lean: 12, headR: -10, neck: 6, talk: 0.25 }), mix(at(1, 'boca', { elR: -18, shRr: -14 }), { lean: 14, headR: -12, neck: 8, talk: 0.1 })), { acts: ['gossip'] });
  c('soc-discutir', 1.4, U, loopOf({ shRp: -60, shRr: -30, elR: 60, shLp: -50, shLr: 24, elL: 70, grip: 0.2, lean: 6, talk: 0.7, twist: -10 }, { shRp: -40, shRr: -10, elR: 90, shLp: -66, shLr: 10, elL: 50, talk: 0.3, twist: 10 }), { acts: ['argue'] });
  c('soc-xingar', 1.4, U, loopOf({ shRp: -84, shRr: -6, elR: 10, grip: 0.4, lean: 10, neck: -6, talk: 0.7 }, { shRp: -88, shRr: -10, elR: 14, lean: 12, neck: -8, talk: 0.4 }), { acts: ['insult'] });
  c('soc-cuspir', 1.2, ['neck', 'lean', 'lookY'], [[0, { neck: 0, lean: 0 }], [0.35, { neck: -10, lean: -4 }], [0.5, { neck: 18, lean: 10 }], [1, { neck: 0, lean: 0 }]], { loop: false, acts: ['spit'] });
  c('soc-mao-dada', 4, ARMS, loopOf({ shRp: -16, shRr: -14, elR: 20, grip: 0.7 }, { shRp: -18, shRr: -16, elR: 18, grip: 0.7 }), { acts: ['handhold'] });
  c('soc-afagar', 2, U, loopOf({ shRp: -46, shRr: -4, elR: 36, grip: 0.1, lean: 14, neck: 12 }, { shRp: -52, shRr: -10, elR: 30, lean: 16, neck: 14 }), { acts: ['caress', 'pet'] });
  c('soc-sobressalto', 1.2, U, [[0, { shLp: 0, shRp: 0, elL: 10, elR: 10, lean: 0, neck: 0 }], [0.18, { shLp: -60, shRp: -60, elL: 110, elR: 110, lean: -4, neck: -10, grip: 0.8, gripL: 0.8 }], [0.6, { shLp: -50, shRp: -50, elL: 100, elR: 100, lean: -2, neck: -6 }], [1, { shLp: 0, shRp: 0, elL: 10, elR: 10, lean: 0, neck: 0 }]], { loop: false, in: 0.08, acts: ['startle'] });
  c('soc-suspirar', 2.4, ['lean', 'neck', 'breath'], [[0, { lean: 0, neck: 0, breath: 0 }], [0.35, { lean: 3, neck: -4, breath: 0.9 }], [0.65, { lean: 7, neck: 13, breath: -0.6 }], [1, { lean: 0, neck: 0, breath: 0 }]], { loop: false, acts: ['sigh'] });
  c('soc-render', 3, U, loopOf({ shLp: -150, shRp: -150, shLr: 22, shRr: -22, elL: 40, elR: 40, grip: 0, gripL: 0, neck: 8 }, { shLp: -146, shRp: -146, shLr: 24, shRr: -24, elL: 44, elR: 44, neck: 10 }), { acts: ['surrender'] });
  c('soc-chamar', 1.8, U, loopOf(mix({ shRp: -96, shRr: -30, elR: 60, grip: 0.1, talk: 0.7, neck: -6 }), { shRp: -88, shRr: -16, elR: 96, talk: 0.4 }), { takes: ['call'] });
})(window.G);
