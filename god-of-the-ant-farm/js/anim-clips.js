'use strict';
// ============================================================
//  Clips: the gestures of a body as keyframes in time (20a,
//  D-343) — the axe brought down, the pick, the spade, the
//  hands at the harvest, the rod cast, the knife at a hide, the
//  talk, the prayer, the wave, the guard and the cut. A clip is
//  a set of joints keyed over its own normalized time (0..1),
//  with a mask (which joints it moves: the whole body, the top,
//  one arm), how long it takes to come in and to go, what the
//  feet do under it (planted, or free), what the hands hold
//  (the thing of G.Inv.held in the hand, the other hand on it),
//  and its events — the contact: the moment the axe meets the
//  wood. Played by the body's animator (anim-body.js) on the
//  action layer, over the base (the stance or the stride), its
//  time warped so that its contact falls on the world's own
//  (G.Act.ANIM's contact, the world's stroke, the body's act).
//  Only seen: nothing here reads or writes the world (rule 113).
//  The guide for writing one: JOGABILIDADE.md, section 4.6.
// ============================================================
(function (G) {
  const Anim = G.Anim3D = G.Anim3D || {};
  const D2R = Math.PI / 180;
  // the joints a clip may key, in the pose's own units: the angles in radians (keyed in degrees, `deg: true`, the default),
  // the rest as they are (metres, fractions of the hips' height, weights)
  const LINEAR = new Set(['bob', 'crouch', 'shift', 'breath', 'grip', 'gripL', 'talk', 'holdW', 'lie', 'prone', 'tool', 'cloth', 'clothS', 'offW', 'reachW']);
  // the masks: which joints a clip moves (the others are the base's)
  const ARM_L = ['shLp', 'shLr', 'shLy', 'elL', 'gripL', 'wristL'], ARM_R = ['shRp', 'shRr', 'shRy', 'elR', 'grip', 'wrist'];
  const HEAD = ['neck', 'lookY', 'talk', 'gazeX', 'gazeY'];
  const TRUNK = ['lean', 'twist', 'sway', 'breath'];
  const LEGS = ['bob', 'crouch', 'shift', 'pelY', 'pelR', 'pelP', 'hipL', 'hipR', 'knL', 'knR', 'anL', 'anR', 'adL', 'adR', 'hyL', 'hyR', 'lie', 'prone'];
  const MASK = Anim.MASK = {
    armR: new Set(ARM_R), armL: new Set(ARM_L), arms: new Set([...ARM_L, ...ARM_R]), head: new Set(HEAD),
    upper: new Set([...ARM_L, ...ARM_R, ...HEAD, ...TRUNK, 'tool', 'offW']),
    full: new Set([...ARM_L, ...ARM_R, ...HEAD, ...TRUNK, ...LEGS, 'tool', 'offW']),
  };
  Anim.LEGS = LEGS;
  const CLIPS = Anim.CLIPS = {};
  const NS = 128; // (each channel sampled round its time once: a clip costs a lookup a joint a frame)
  // a clip, registered once by its id: { dur, loop, mask, feet, in, out, events: { contact }, item, keys: { joint: [[u, v]…] },
  // deg, base, speed }. Its keys are sampled at once; a second clip with the same id is refused, and counted (Anim.clipErr) —
  // one id, one gesture, as the world's gestures (Act.addAnim)
  Anim.clipErr = [];
  Anim.clip = function (id, def) {
    if (!id || !def || !def.keys) { Anim.clipErr.push(`clipe ${id}: sem chaves`); return null; }
    if (CLIPS[id]) { Anim.clipErr.push(`clipe ${id}: já existe`); return CLIPS[id]; }
    const deg = def.deg !== false, loop = def.loop !== false;
    const c = { id, dur: def.dur > 0 ? def.dur : 1, loop, mask: Array.isArray(def.mask) ? new Set(def.mask) : MASK[def.mask || 'full'] || MASK.full,
      feet: def.feet || 'plant', bin: def.in >= 0 ? def.in : 0.22, bout: def.out >= 0 ? def.out : 0.28, events: Object.assign({ contact: 0.5 }, def.events || {}),
      item: def.item || null, base: def.base || 'idle', ch: [], tab: [], keys: def.keys, period: def.period > 0 ? def.period : 0, stance: def.stance || null };
    for (const j in def.keys) {
      const k = def.keys[j]; if (!Array.isArray(k) || !k.length) { Anim.clipErr.push(`clipe ${id}: a junta ${j} sem chaves`); continue; }
      const sc = deg && !LINEAR.has(j) ? D2R : 1; const pts = k.map(p => [p[0], p[1] * sc]).sort((a, b) => a[0] - b[0]);
      if (pts.some(p => !Number.isFinite(p[0]) || !Number.isFinite(p[1]) || p[0] < 0 || p[0] > 1)) { Anim.clipErr.push(`clipe ${id}: a junta ${j} com chave fora de 0..1`); continue; }
      c.ch.push(j); c.tab.push(sample(pts, loop));
    }
    for (const e in c.events) if (!(c.events[e] >= 0 && c.events[e] <= 1)) Anim.clipErr.push(`clipe ${id}: o evento ${e} fora de 0..1`);
    CLIPS[id] = c; c.acts = Array.isArray(def.acts) ? def.acts.slice() : null; if (c.acts && Anim.CLIP_OF) bindActs(c); return c;
  };
  // (the acts a clip shows, said with it — `acts: ['golpe']` —: a clip of another file shows its acts without a line here; an act
  // already shown by another clip is refused and counted)
  function bindActs(c) { for (const a of c.acts) { const o = Anim.CLIP_OF[a]; if (o && o !== c.id) Anim.clipErr.push(`clipe ${c.id}: o ato ${a} já mostra o clipe ${o}`); else Anim.CLIP_OF[a] = c.id; } }
  // (a channel round its time: Catmull-Rom through the keys — wrapping round for a loop, held at the ends for a one-shot)
  function sample(pts, loop) {
    const out = new Float32Array(NS + 1);
    // (a loop's key at 1 is its key at 0: one of them kept)
    let K = loop && pts.length > 1 && pts[pts.length - 1][0] >= 1 && pts[0][0] <= 0 ? pts.slice(0, -1) : pts.slice();
    const n = K.length; if (n === 1) { out.fill(K[0][1]); return out; }
    // (the keys extended two each way: round the cycle for a loop, the ends held for a one-shot)
    const E = loop ? [[K[n - 2][0] - 1, K[n - 2][1]], [K[n - 1][0] - 1, K[n - 1][1]], ...K, [K[0][0] + 1, K[0][1]], [K[1][0] + 1, K[1][1]]]
      : [[K[0][0] - 2, K[0][1]], [K[0][0] - 1, K[0][1]], ...K, [K[n - 1][0] + 1, K[n - 1][1]], [K[n - 1][0] + 2, K[n - 1][1]]];
    for (let s = 0; s <= NS; s++) {
      const u = s / NS;
      if (!loop && (u <= K[0][0] || u >= K[n - 1][0])) { out[s] = u <= K[0][0] ? K[0][1] : K[n - 1][1]; continue; }
      let i = 1; while (i < E.length - 3 && E[i + 1][0] <= u) i++;
      const p0 = E[i - 1], p1 = E[i], p2 = E[i + 1], p3 = E[i + 2];
      const d1 = Math.max(1e-6, p2[0] - p1[0]), t = Math.max(0, Math.min(1, (u - p1[0]) / d1)), t2 = t * t, t3 = t2 * t;
      // (the tangents of a non-uniform Catmull-Rom: the keys need not be evenly spaced)
      const m1 = (p2[1] - p0[1]) / Math.max(1e-6, p2[0] - p0[0]) * d1, m2 = (p3[1] - p1[1]) / Math.max(1e-6, p3[0] - p1[0]) * d1;
      out[s] = (2 * t3 - 3 * t2 + 1) * p1[1] + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2[1] + (t3 - t2) * m2;
    }
    return out;
  }
  // a clip's channel at time u (0..1: a loop wraps, a one-shot holds its ends)
  const at = (tab, u, loop) => { u = loop ? u - Math.floor(u) : u < 0 ? 0 : u > 1 ? 1 : u; const x = u * NS, i = x | 0, f = x - i; return i >= NS ? tab[NS] : tab[i] + (tab[i + 1] - tab[i]) * f; };
  // the clip's pose at u written into out, blended in by w for the joints of its mask (w 1: the clip's own; the others untouched)
  Anim.playClip = function (out, c, u, w) {
    if (!c || !(w > 0)) return out;
    for (let i = 0; i < c.ch.length; i++) { const j = c.ch[i]; if (!c.mask.has(j)) continue; const v = at(c.tab[i], u, c.loop); const o = out[j] || 0; out[j] = w >= 1 ? v : o + (v - o) * w; }
    return out;
  };
  // the clip's time for a moment of an act: the act's own time k (0..1) warped so that the act's contact (kc, 0..1) falls on
  // the clip's — the axe meets the wood when the world says the stroke lands (G.Act.ANIM, the body's act)
  Anim.warpTime = function (c, k, kc) {
    const cc = c.events.contact; if (!(kc > 0 && kc < 1)) return k;
    return k <= kc ? k / kc * cc : cc + (k - kc) / (1 - kc) * (1 - cc);
  };
  // a looping clip in step with a world clock t (seconds of the world) whose strokes repeat every `period` seconds and land at
  // t = period, 2·period… (v.actT: reset by the world at each stroke, or counting on): its time, its contact on the world's
  Anim.loopTime = function (c, t, period) { const k = period > 0 ? (t / period) % 1 : 0; return (c.events.contact + k) % 1; };
  Anim.clipOf = id => CLIPS[id] || null;

  // ============================== the gestures (20a) ==============================
  // Keyed in degrees (the angles) on the clip's own time: the shoulders' swing (minus forward and up) and their opening (shLr plus
  // and shRr minus away from the body), the elbows' bend, the trunk's bow (lean) and turn (twist: plus to the body's left), the
  // head's bow (neck), the hips' drop (crouch, a fraction of their height), the knees; the right wrist turns the worked thing
  // (wrist: 0 the thing straight out of the fist, plus down along the forearm's line, minus back toward the elbow); offW the other
  // hand on a thing of two hands (where its art says it goes); tool 1 the thing in the hand worked. The feet planted where the
  // stance puts them (stance: [half the feet's width, the left foot forward, the right]); a loop's contact is where its world
  // stroke lands (period: the world's seconds of one stroke, when the world counts it on v.actT)
  const K = (id, def) => Anim.clip(id, def);
  // (the axe at a tree: the stance wide and the left foot ahead, the axe drawn back over the right shoulder, the trunk wound to
  // the right; brought down and across, the weight onto the front foot, the knees giving; it bites at the waist and is wrenched
  // out; both hands on the haft)
  K('chop', { dur: 1.5, period: 0.55, stance: [0.17, 0.14, -0.1], item: { hand: 'mao', two: true }, events: { contact: 0.66 },
    keys: {
      shRp: [[0, -55], [0.22, -95], [0.45, -150], [0.56, -140], [0.66, -62], [0.74, -52], [0.88, -58], [1, -55]],
      shRr: [[0, -12], [0.45, -38], [0.6, -20], [0.66, -8], [0.8, -10], [1, -12]],
      elR: [[0, 55], [0.45, 100], [0.56, 92], [0.66, 18], [0.74, 22], [0.88, 45], [1, 55]],
      wrist: [[0, 0.6], [0.45, -0.7], [0.56, -0.45], [0.66, 1.25], [0.76, 1.15], [0.9, 0.8], [1, 0.6]].map(([u, w]) => [u, w * 57.3]),
      lean: [[0, 0.16], [0.45, -0.04], [0.56, 0.02], [0.66, 0.42], [0.76, 0.36], [1, 0.16]].map(([u, w]) => [u, w * 57.3]),
      twist: [[0, 0.05], [0.45, -0.42], [0.56, -0.38], [0.66, 0.26], [0.78, 0.22], [1, 0.05]].map(([u, w]) => [u, w * 57.3]),
      crouch: [[0, 0.03], [0.45, 0.0], [0.66, 0.09], [0.8, 0.07], [1, 0.03]],
      knL: [[0, 9], [0.45, 5], [0.66, 20], [1, 9]], knR: [[0, 11], [0.45, 16], [0.66, 14], [1, 11]],
      neck: [[0, 14], [0.45, 4], [0.66, 20], [1, 14]], offW: [[0, 1], [1, 1]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the pick at the rock: raised high over the head with both hands, the body rising onto the toes a little; driven down onto the
  // stone before the feet, the back bowed, the knees bent; worked free and lifted again)
  K('mine', { dur: 1.7, period: 2.2, stance: [0.16, 0.1, -0.06], item: { hand: 'mao', two: true }, events: { contact: 0.62 },
    keys: {
      shRp: [[0, -60], [0.25, -120], [0.48, -168], [0.54, -160], [0.62, -45], [0.72, -40], [0.86, -55], [1, -60]],
      shRr: [[0, -10], [0.48, -22], [0.62, -6], [1, -10]],
      elR: [[0, 40], [0.48, 85], [0.54, 75], [0.62, 8], [0.72, 12], [1, 40]],
      wrist: [[0, 40], [0.48, -45], [0.54, -30], [0.62, 75], [0.72, 70], [1, 40]],
      lean: [[0, 22], [0.48, -6], [0.54, 0], [0.62, 38], [0.74, 34], [1, 22]],
      crouch: [[0, 0.05], [0.48, -0.01], [0.62, 0.12], [0.76, 0.1], [1, 0.05]],
      knL: [[0, 14], [0.48, 4], [0.62, 32], [1, 14]], knR: [[0, 14], [0.48, 6], [0.62, 30], [1, 14]],
      neck: [[0, 25], [0.48, 5], [0.62, 32], [1, 25]], twist: [[0, 0], [0.48, -8], [0.62, 4], [1, 0]],
      offW: [[0, 1], [1, 1]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the spade: its blade driven into the ground before the feet, the weight leaning on it; levered back; lifted and the earth thrown
  // to the left; back to the ground — both hands on the haft, the other low on it)
  K('dig', { dur: 2.0, period: 2.0, stance: [0.15, 0.12, -0.05], item: { hand: 'mao', two: true }, events: { contact: 0.3 },
    keys: {
      shRp: [[0, -40], [0.18, -55], [0.3, -18], [0.42, -22], [0.55, -50], [0.72, -95], [0.82, -85], [1, -40]],
      shRr: [[0, -12], [0.3, -8], [0.72, -25], [1, -12]],
      elR: [[0, 45], [0.18, 55], [0.3, 25], [0.42, 30], [0.55, 60], [0.72, 80], [1, 45]],
      wrist: [[0, -100], [0.3, -95], [0.55, -70], [0.72, -40], [0.82, -55], [1, -100]],
      lean: [[0, 25], [0.18, 20], [0.3, 40], [0.42, 30], [0.55, 12], [0.72, 18], [1, 25]],
      twist: [[0, 0], [0.42, -6], [0.6, 5], [0.72, 30], [0.84, 20], [1, 0]],
      crouch: [[0, 0.06], [0.3, 0.12], [0.55, 0.05], [0.72, 0.04], [1, 0.06]],
      knL: [[0, 15], [0.3, 32], [0.55, 12], [1, 15]], knR: [[0, 18], [0.3, 28], [0.55, 14], [1, 18]],
      neck: [[0, 30], [0.3, 35], [0.72, 15], [1, 30]], offW: [[0, 1], [1, 1]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the hoe at the field: the blade lifted before the body and chopped down into the soil, drawn back toward the feet)
  K('hoe', { dur: 1.6, period: 1.6, stance: [0.15, 0.12, -0.06], item: { hand: 'mao', two: true }, events: { contact: 0.5 },
    keys: {
      shRp: [[0, -50], [0.35, -110], [0.5, -40], [0.7, -30], [1, -50]], elR: [[0, 40], [0.35, 70], [0.5, 15], [0.7, 30], [1, 40]],
      wrist: [[0, 30], [0.35, -20], [0.5, 60], [0.7, 50], [1, 30]], lean: [[0, 25], [0.35, 10], [0.5, 35], [0.7, 30], [1, 25]],
      crouch: [[0, 0.05], [0.5, 0.1], [1, 0.05]], knL: [[0, 12], [0.5, 25], [1, 12]], knR: [[0, 12], [0.5, 22], [1, 12]], neck: [[0, 30], [0.5, 35], [1, 30]],
      offW: [[0, 1], [1, 1]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the hammer at work — a building, the anvil: short strokes of the forearm from the elbow, the other hand holding what is struck)
  K('hammer', { dur: 0.75, period: 0.75, stance: [0.14, 0.08, -0.04], item: { hand: 'mao' }, events: { contact: 0.55 },
    keys: {
      shRp: [[0, -55], [0.3, -95], [0.42, -100], [0.55, -50], [0.65, -48], [1, -55]], shRr: [[0, -18], [0.42, -28], [0.55, -14], [1, -18]],
      elR: [[0, 70], [0.3, 115], [0.42, 120], [0.55, 45], [0.65, 50], [1, 70]],
      wrist: [[0, 20], [0.42, -35], [0.55, 55], [0.65, 45], [1, 20]],
      shLp: [[0, -48], [1, -48]], shLr: [[0, 12], [1, 12]], elL: [[0, 70], [1, 70]], gripL: [[0, 0.8], [1, 0.8]],
      lean: [[0, 22], [0.42, 16], [0.55, 26], [1, 22]], neck: [[0, 30], [1, 30]], crouch: [[0, 0.03], [1, 0.03]], knL: [[0, 10], [1, 10]], knR: [[0, 10], [1, 10]],
      twist: [[0, -4], [0.42, -10], [0.55, 2], [1, -4]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the harvest, the gathering, the planting: bent at the knees and the hips over the plants, the hands reaching in, plucking and
  // putting what they took into the other — the trunk rocking a little with each reach)
  K('harvest', { dur: 2.2, base: 'idle', stance: [0.16, 0.06, -0.06], events: { contact: 0.45 },
    keys: {
      crouch: [[0, 0.3], [0.5, 0.33], [1, 0.3]], lean: [[0, 50], [0.3, 58], [0.5, 54], [0.8, 46], [1, 50]], neck: [[0, 20], [0.5, 25], [1, 20]],
      hipL: [[0, -55], [1, -55]], hipR: [[0, -45], [1, -45]], knL: [[0, 70], [1, 70]], knR: [[0, 62], [1, 62]],
      shRp: [[0, -65], [0.3, -85], [0.45, -78], [0.65, -55], [0.85, -60], [1, -65]], shRr: [[0, -10], [0.3, -18], [0.65, -4], [1, -10]],
      elR: [[0, 30], [0.3, 12], [0.45, 20], [0.65, 70], [0.85, 55], [1, 30]],
      shLp: [[0, -60], [0.5, -55], [1, -60]], shLr: [[0, 14], [1, 14]], elL: [[0, 55], [0.65, 65], [1, 55]],
      grip: [[0, 0.3], [0.42, 0.9], [0.65, 0.8], [0.8, 0.2], [1, 0.3]], gripL: [[0, 0.6], [1, 0.6]], twist: [[0, 4], [0.3, -6], [0.65, 6], [1, 4]],
    } });
  // (the rod at the water: drawn back over the shoulder, cast forward with the forearm — the line out —, then held low before the
  // body, the tip twitched now and then, the other hand at the butt)
  K('fish', { dur: 4.0, stance: [0.13, 0.1, -0.04], item: { hand: 'mao', two: true }, events: { contact: 0.12 },
    keys: {
      shRp: [[0, -110], [0.06, -128], [0.12, -60], [0.18, -45], [0.5, -42], [0.62, -48], [0.68, -42], [0.9, -42], [1, -110]],
      elR: [[0, 95], [0.06, 105], [0.12, 40], [0.18, 50], [0.5, 55], [0.62, 62], [0.68, 55], [1, 95]],
      wrist: [[0, -40], [0.06, -60], [0.12, 30], [0.18, 10], [0.5, 8], [0.62, -5], [0.68, 8], [0.9, 8], [1, -40]],
      shRr: [[0, -15], [1, -15]], lean: [[0, 4], [0.12, 14], [0.2, 8], [1, 4]], neck: [[0, 10], [0.2, 18], [1, 10]], twist: [[0, -10], [0.12, 6], [0.25, 0], [1, -10]],
      offW: [[0, 0.6], [0.2, 1], [0.9, 1], [1, 0.6]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the reel: the catch drawn in, the rod raised and lowered, both hands on it)
  K('reel', { dur: 1.2, stance: [0.13, 0.1, -0.04], item: { hand: 'mao', two: true }, events: { contact: 0.5 },
    keys: {
      shRp: [[0, -55], [0.5, -85], [1, -55]], elR: [[0, 60], [0.5, 80], [1, 60]], wrist: [[0, -10], [0.5, -35], [1, -10]],
      lean: [[0, -6], [0.5, -10], [1, -6]], neck: [[0, 15], [1, 15]], crouch: [[0, 0.04], [0.5, 0.06], [1, 0.04]], knL: [[0, 12], [1, 12]], knR: [[0, 14], [1, 14]],
      offW: [[0, 1], [1, 1]], grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]],
    } });
  // (the knife at a carcass — skinning, butchering: down on one knee beside it, the left hand holding the hide back, the knife in
  // short drawing cuts)
  K('skin', { dur: 1.4, base: 'idle', feet: 'free', item: { hand: 'mao' }, events: { contact: 0.55 },
    keys: {
      crouch: [[0, 0.5], [1, 0.5]], lean: [[0, 40], [0.5, 46], [1, 40]], neck: [[0, 30], [1, 30]],
      hipL: [[0, -95], [1, -95]], knL: [[0, 110], [1, 110]], hipR: [[0, 10], [1, 10]], knR: [[0, 115], [1, 115]], anR: [[0, -30], [1, -30]],
      shRp: [[0, -60], [0.35, -75], [0.55, -40], [0.75, -45], [1, -60]], shRr: [[0, -14], [0.55, -6], [1, -14]], elR: [[0, 70], [0.35, 85], [0.55, 40], [0.75, 45], [1, 70]],
      wrist: [[0, 60], [0.35, 40], [0.55, 95], [0.75, 90], [1, 60]],
      shLp: [[0, -55], [0.5, -50], [1, -55]], shLr: [[0, 18], [1, 18]], elL: [[0, 35], [0.5, 45], [1, 35]], gripL: [[0, 0.9], [1, 0.9]],
      grip: [[0, 1], [1, 1]], tool: [[0, 1], [1, 1]], twist: [[0, 4], [0.55, -6], [1, 4]],
    } });
  // (a word: the hands that talk — one, then the other, opening and turning —, the head nodding with what is said, the weight on one
  // foot; over the stride too, the top only)
  K('talk', { dur: 3.2, mask: 'upper', events: { contact: 0.5 },
    keys: {
      shRp: [[0, -18], [0.15, -42], [0.3, -30], [0.5, -16], [0.7, -38], [0.85, -26], [1, -18]], shRr: [[0, -12], [0.15, -20], [0.5, -10], [0.7, -22], [1, -12]],
      elR: [[0, 40], [0.15, 75], [0.3, 60], [0.5, 30], [0.7, 70], [0.85, 55], [1, 40]],
      shLp: [[0, -8], [0.3, -10], [0.45, -30], [0.6, -20], [0.8, -8], [1, -8]], shLr: [[0, 10], [0.45, 18], [1, 10]], elL: [[0, 20], [0.45, 60], [0.6, 45], [0.8, 20], [1, 20]],
      neck: [[0, 2], [0.2, 7], [0.35, 0], [0.55, 6], [0.75, -2], [1, 2]], twist: [[0, 3], [0.25, -4], [0.5, 4], [0.75, -3], [1, 3]],
      talk: [[0, 0.2], [0.05, 0.7], [0.1, 0.2], [0.18, 0.6], [0.26, 0.1], [0.34, 0.65], [0.42, 0.15], [0.55, 0.7], [0.62, 0.2], [0.7, 0.55], [0.8, 0.1], [0.9, 0.6], [1, 0.2]],
      grip: [[0, 0.2], [0.15, 0.05], [0.5, 0.3], [1, 0.2]],
    } });
  // (a hand to a thing — a door, a shelf, a pole, a crate's lid: reached out at the chest, the fingers working, and back)
  K('interact', { dur: 1.2, mask: 'upper', events: { contact: 0.45 },
    keys: {
      shRp: [[0, -30], [0.3, -72], [0.45, -78], [0.7, -70], [1, -30]], shRr: [[0, -10], [0.45, -6], [1, -10]], elR: [[0, 40], [0.3, 25], [0.45, 18], [0.7, 30], [1, 40]],
      grip: [[0, 0.2], [0.4, 0.1], [0.5, 0.8], [0.7, 0.6], [1, 0.2]], lean: [[0, 4], [0.45, 12], [1, 4]], neck: [[0, 8], [0.45, 16], [1, 8]],
    } });
  // (a wave: the arm up, the hand to and fro from the elbow, the head up a little)
  K('wave', { dur: 1.6, mask: 'upper', in: 0.18, out: 0.3, events: { contact: 0.5 },
    keys: {
      shRp: [[0, -40], [0.12, -150], [0.85, -150], [1, -40]], shRr: [[0, -20], [0.12, -38], [0.3, -20], [0.45, -40], [0.6, -20], [0.75, -40], [0.85, -30], [1, -20]],
      elR: [[0, 30], [0.12, 40], [0.3, 25], [0.45, 50], [0.6, 25], [0.75, 50], [0.85, 35], [1, 30]], grip: [[0, 0.1], [1, 0.1]], neck: [[0, 0], [0.2, -6], [0.8, -6], [1, 0]],
    } });
  // (the prayer: down on both knees, the hands raised before the face, the head bowed and lifted)
  K('pray', { dur: 6, base: 'idle', feet: 'free', in: 0.5, out: 0.5, events: { contact: 0.5 },
    keys: {
      crouch: [[0, 0.45], [1, 0.45]], hipL: [[0, -6], [1, -6]], hipR: [[0, -6], [1, -6]], knL: [[0, 95], [1, 95]], knR: [[0, 95], [1, 95]], anL: [[0, -55], [1, -55]], anR: [[0, -55], [1, -55]],
      shLp: [[0, -100], [0.4, -125], [0.6, -125], [1, -100]], shRp: [[0, -100], [0.4, -125], [0.6, -125], [1, -100]], shLr: [[0, -10], [1, -10]], shRr: [[0, 10], [1, 10]],
      elL: [[0, 100], [0.4, 70], [0.6, 70], [1, 100]], elR: [[0, 100], [0.4, 70], [0.6, 70], [1, 100]], lean: [[0, 12], [0.4, -4], [0.6, -4], [1, 12]], neck: [[0, 30], [0.4, -12], [0.6, -12], [1, 30]],
      grip: [[0, 0.1], [1, 0.1]], gripL: [[0, 0.1], [1, 0.1]],
    } });
  // (the meal at the table: the bowl in the left hand, the right bringing the food to the mouth and back, a pause; the head to it)
  K('eat', { dur: 2.4, base: 'sit', feet: 'free', events: { contact: 0.4 },
    keys: {
      shRp: [[0, -35], [0.25, -55], [0.4, -62], [0.55, -45], [0.7, -32], [1, -35]], shRr: [[0, -12], [0.4, -18], [1, -12]], elR: [[0, 75], [0.25, 120], [0.4, 135], [0.55, 100], [0.7, 70], [1, 75]],
      shLp: [[0, -30], [1, -30]], elL: [[0, 80], [1, 80]], shLr: [[0, 14], [1, 14]], gripL: [[0, 0.7], [1, 0.7]], grip: [[0, 0.7], [1, 0.7]],
      neck: [[0, 14], [0.35, 4], [0.45, 2], [0.6, 12], [1, 14]], lean: [[0, 16], [0.4, 10], [1, 16]], talk: [[0, 0], [0.38, 0.5], [0.45, 0], [0.55, 0.3], [0.62, 0], [1, 0]],
    } });
  // (the fight with a blade: on guard, the feet apart and the knees bent, the weapon before the body; a cut down from over the
  // right shoulder, a thrust, back to the guard — the weight going with each)
  K('fight', { dur: 1.6, period: 1.6, stance: [0.2, 0.16, -0.14], item: { hand: 'mao' }, events: { contact: 0.32, contact2: 0.78 },
    keys: {
      crouch: [[0, 0.07], [0.32, 0.1], [0.5, 0.07], [0.78, 0.11], [1, 0.07]], lean: [[0, 8], [0.22, 0], [0.32, 22], [0.5, 8], [0.7, 4], [0.78, 26], [1, 8]],
      twist: [[0, -10], [0.2, -30], [0.32, 18], [0.5, -10], [0.7, -16], [0.78, 10], [1, -10]],
      shRp: [[0, -55], [0.2, -150], [0.32, -55], [0.42, -45], [0.5, -55], [0.68, -60], [0.78, -88], [0.88, -70], [1, -55]],
      shRr: [[0, -20], [0.2, -35], [0.32, -10], [0.5, -20], [0.78, -8], [1, -20]],
      elR: [[0, 70], [0.2, 95], [0.32, 18], [0.42, 25], [0.5, 70], [0.68, 95], [0.78, 8], [0.88, 30], [1, 70]],
      wrist: [[0, 15], [0.2, -55], [0.32, 70], [0.42, 55], [0.5, 15], [0.68, 10], [0.78, 85], [0.88, 60], [1, 15]],
      shLp: [[0, -45], [0.32, -30], [0.5, -45], [0.78, -20], [1, -45]], shLr: [[0, 25], [0.32, 35], [0.78, 30], [1, 25]], elL: [[0, 85], [0.32, 60], [0.5, 85], [0.78, 50], [1, 85]],
      knL: [[0, 25], [0.32, 34], [0.78, 36], [1, 25]], knR: [[0, 28], [0.32, 22], [0.78, 20], [1, 28]], neck: [[0, -4], [0.32, 6], [0.78, 6], [1, -4]],
      grip: [[0, 1], [1, 1]], gripL: [[0, 0.6], [1, 0.6]], tool: [[0, 1], [1, 1]],
    } });
  // the clip of a world's act (v.act, the body's act's vact): the gestures above for the acts they show
  const CLIP_OF = Anim.CLIP_OF = { chop: 'chop', cut: 'chop', mine: 'mine', dig: 'dig', rake: 'hoe', hammer: 'hammer', build: 'hammer', forge: 'hammer', beat: 'hammer',
    pick: 'harvest', gather: 'harvest', plant: 'harvest', harvest: 'harvest', fish: 'fish', reel: 'reel', skin: 'skin', butcher: 'skin',
    talk: 'talk', chat: 'talk', call: 'talk', shout: 'talk', sell: 'talk', buy: 'talk', serve: 'talk', haggle: 'talk', question: 'talk', listen: 'talk',
    knock: 'interact', examine: 'interact', count: 'interact', pay: 'interact', undress: 'interact', point: 'interact',
    wave: 'wave', pray: 'pray', kneel: 'pray', swear: 'pray', eat: 'eat', fight: 'fight', stab: 'fight', brandish: 'fight' };
  for (const id in CLIPS) if (CLIPS[id].acts) bindActs(CLIPS[id]);

  // (every clip a state the drawing knows — the coverage of the acts, qa/matriz.js —, and its pose for whoever asks by its name:
  // its base with the clip at the time t, in seconds of its own pace)
  const STATES = Anim.STATES || (Anim.STATES = []);
  Anim.addStates = () => { for (const id in CLIPS) if (!STATES.includes(id)) STATES.push(id); };
  Anim.addStates();
  const basePose = Anim.pose;
  if (basePose) Anim.pose = (st, t, sp) => { const c = CLIPS[st]; if (!c) return basePose(st, t, sp); const out = Object.assign(Anim.POSE0(), basePose(c.base, t, sp)); Anim.playClip(out, c, (t || 0) / c.dur, 1); out.stL = out.stR = 1; return out; };
  // (the clips of other files — the next wave's — queued where they load before this one: G.ANIM_CLIPS.push([id, def]))
  const Q = G.ANIM_CLIPS || []; G.ANIM_CLIPS = { push: e => { const c = Anim.clip(e[0], e[1]); Anim.addStates(); return c; } }; for (const e of Q) Anim.clip(e[0], e[1]); Anim.addStates();
})(window.G);
