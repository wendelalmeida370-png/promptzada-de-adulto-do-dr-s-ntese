'use strict';
// ============================================================
//  The fight's gestures (20f, D-410 to D-424): the clips of the
//  blows of each way of fighting — the fists, the knife, the
//  sword, the axe and the club, the spear, the thing of two
//  hands —, light ones in a row and the heavy one charged; the
//  guard (the shield, the blade across, the fists up); the bow
//  aimed, drawn and loosed; the jolt of a blow taken. Each blow
//  is seen before it lands: the guard, the windup, the cut at
//  the contact (the world's — G.Combate.MOVES' hit), the
//  follow-through, the guard again.
//  The people of the world fight with them too: their fights
//  stay the world's (war.js, army.js — the same draws), and the
//  drawing picks the gesture of the weapon in their hands for
//  the act the world gives ('fight'), in step with the world's
//  own blow (v.actT; G.Anim3D.loopTime): G.Anim3D.stateOf asks
//  here first. Only seen: nothing here writes the world.
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS || (G.ANIM_CLIPS = []);
  const add = (id, def) => Q.push([id, def]);
  // (a pose: joints in degrees — the rest as the clip guide has them, JOGABILIDADE.md §4.6; keys built from poses at times, each
  // pose filling what it does not say from the first one)
  function keysOf(list) {
    const g = list[0][1]; const J = new Set(); for (const [, p] of list) for (const j in p) J.add(j);
    const out = {}; for (const j of J) out[j] = list.map(([u, p]) => [u, p[j] !== undefined ? p[j] : g[j] !== undefined ? g[j] : 0]);
    return out;
  }
  const mix = (a, b) => Object.assign({}, a, b);
  // ------------------------------ the guards: the stance each blow starts from and comes back to ------------------------------
  const G1 = { shRp: -50, shRr: -18, elR: 75, wrist: 20, shLp: -40, shLr: 22, elL: 80, lean: 8, twist: -10, crouch: 0.07, knL: 22, knR: 26, neck: -2, grip: 1, gripL: 0.6, tool: 1 };
  const GF = { shRp: -62, shRr: -10, elR: 125, wrist: 0, shLp: -66, shLr: 12, elL: 125, lean: 12, twist: -8, crouch: 0.08, knL: 22, knR: 26, neck: 8, grip: 1, gripL: 1, tool: 0 };
  const GS = { shRp: -60, shRr: -15, elR: 60, wrist: 80, shLp: -30, shLr: 15, elL: 70, lean: 10, twist: -20, crouch: 0.1, knL: 28, knR: 24, neck: 0, grip: 1, gripL: 1, offW: 1, tool: 1 };
  const G2 = { shRp: -55, shRr: -15, elR: 70, wrist: 40, shLp: -35, shLr: 15, elL: 70, lean: 10, twist: -15, crouch: 0.08, knL: 24, knR: 24, neck: 0, grip: 1, gripL: 1, offW: 1, tool: 1 };
  const ST1 = [0.18, 0.14, -0.12], ST2 = [0.2, 0.2, -0.16];
  // the blow of the body: guard → windup → the cut at its contact c → follow-through → guard, one time through (its time is the
  // act's: G.Avatar.act, the contact where G.Combate.MOVES says it lands); the heavy one from its windup — the charge held it
  const M = G.Combate && G.Combate.MOVES;
  function blow(id, cls, i, g, w, hit, f, o) {
    const mv = M ? (i < 0 ? M[cls].p : M[cls].l[i]) : { dur: 0.6, hit: 0.45 }; const c = mv.hit; const two = cls === 'lanca' || cls === 'duas';
    add(id, Object.assign({ dur: mv.dur, loop: false, mask: 'full', in: 0.06, out: 0.2, stance: two ? ST2 : ST1, item: cls === 'punho' ? null : { hand: 'mao', two }, events: { contact: c },
      keys: keysOf(i < 0 ? [[0, mix(g, w)], [c, mix(g, hit)], [c + (1 - c) * 0.35, mix(g, f)], [1, g]] : [[0, g], [c * 0.55, mix(g, w)], [c, mix(g, hit)], [c + (1 - c) * 0.35, mix(g, f)], [1, g]]) }, o || {}));
  }
  // the heavy blow charging: its windup held, trembling a little with the strain (a loop: as long as the key is held)
  function charge(id, cls, g, w) { add(id, { dur: 0.9, mask: 'full', in: 0.16, out: 0.1, stance: cls === 'lanca' || cls === 'duas' ? ST2 : ST1, item: cls === 'punho' ? null : { hand: 'mao', two: cls === 'lanca' || cls === 'duas' }, events: { contact: 0.5 },
    keys: keysOf([[0, mix(g, w)], [0.5, mix(mix(g, w), { elR: (w.elR !== undefined ? w.elR : g.elR) + 4, lean: (w.lean !== undefined ? w.lean : g.lean) - 2, crouch: (w.crouch !== undefined ? w.crouch : g.crouch) + 0.02 })], [1, mix(g, w)]]) }); }
  // the people of the world in their fights: the same blow as a loop on the world's own clock of it — its contact where the world
  // strikes (v.actT reset at each blow, G.Anim3D.loopTime), the guard held between, the windup before the next. period: the
  // world's seconds between two blows (the longest of war.js's draw, 0.8 to 1.1 s: the cut always comes in time); and the one
  // fighting the body on the body's clock (G.Combate: × the body's time)
  const TIME = (G.Space && G.Space.TIME) || 0.35;
  function world(id, cls, g, w, hit, f, period, acts) {
    const two = cls === 'lanca' || cls === 'duas';
    add(id, { dur: period, period, loop: true, mask: 'full', in: 0.12, out: 0.25, stance: two ? ST2 : ST1, item: cls === 'punho' ? null : { hand: 'mao', two }, events: { contact: 0.6 }, acts,
      keys: keysOf([[0, g], [0.34, g], [0.5, mix(g, w)], [0.6, mix(g, hit)], [0.72, mix(g, f)], [0.86, g], [1, g]]) });
  }
  // ------------------------------ the blows ------------------------------
  const B = {
    punho: { g: GF, l: [
      [{ shRp: -66, elR: 135, twist: -14 }, { shRp: -92, elR: 8, twist: 16, lean: 16 }, { shRp: -85, elR: 30, twist: 10, lean: 14 }],
      [{ shLp: -64, elL: 135, twist: 12 }, { shLp: -92, elL: 8, twist: -20, lean: 16 }, { shLp: -85, elL: 30, twist: -14 }],
      [{ shRp: -60, shRr: -62, elR: 92, twist: -32 }, { shRp: -86, shRr: 22, elR: 85, twist: 32, lean: 16 }, { shRp: -80, shRr: 30, elR: 90, twist: 36 }]],
      p: [{ shRp: -40, shRr: -72, elR: 82, twist: -46, lean: 0, crouch: 0.1 }, { shRp: -92, shRr: 32, elR: 40, twist: 42, lean: 24, crouch: 0.13, knL: 34 }, { shRp: -75, shRr: 40, elR: 55, twist: 46, lean: 22 }] },
    faca: { g: G1, l: [
      [{ shRp: -70, shRr: -46, elR: 70, wrist: 0, twist: -30 }, { shRp: -82, shRr: 10, elR: 30, wrist: 40, twist: 25, lean: 14 }, { shRp: -72, shRr: 26, elR: 50, twist: 30 }],
      [{ shRp: -70, shRr: 26, elR: 100, twist: 25 }, { shRp: -82, shRr: -35, elR: 30, wrist: 20, twist: -25, lean: 12 }, { shRp: -75, shRr: -46, elR: 40, twist: -30 }],
      [{ shRp: -50, elR: 122, wrist: 10, twist: -22 }, { shRp: -86, elR: 10, wrist: 75, twist: 12, lean: 24, crouch: 0.1 }, { shRp: -84, elR: 14, wrist: 72, lean: 22 }]],
      p: [{ shRp: -160, shRr: -20, elR: 80, wrist: -70, lean: -4 }, { shRp: -50, elR: 30, wrist: 60, lean: 30, crouch: 0.14, knL: 38 }, { shRp: -32, elR: 40, wrist: 55, lean: 26 }] },
    espada: { g: G1, l: [
      [{ shRp: -150, shRr: -38, elR: 100, wrist: -55, lean: -2, twist: -32, crouch: 0.05, knR: 20 }, { shRp: -60, shRr: -8, elR: 20, wrist: 70, lean: 22, twist: 22, crouch: 0.1, knL: 34 }, { shRp: -35, shRr: 5, elR: 30, wrist: 55, lean: 18, twist: 30 }],
      [{ shRp: -40, shRr: 26, elR: 110, wrist: 30, twist: 30, lean: 10 }, { shRp: -100, shRr: -40, elR: 25, wrist: -20, twist: -25, lean: 12 }, { shRp: -125, shRr: -45, elR: 40, wrist: -35, twist: -35 }],
      [{ shRp: -45, shRr: -10, elR: 120, wrist: 10, twist: -26, lean: 2 }, { shRp: -90, shRr: -8, elR: 5, wrist: 80, twist: 12, lean: 26, crouch: 0.12, knL: 38 }, { shRp: -86, elR: 10, wrist: 78, twist: 10, lean: 24 }]],
      p: [{ shRp: -172, shRr: -20, elR: 70, wrist: -62, lean: -8, twist: -12, crouch: 0.03, shLp: -20 }, { shRp: -50, shRr: -5, elR: 10, wrist: 80, lean: 32, twist: 8, crouch: 0.15, knL: 42, knR: 30, shLp: 10 }, { shRp: -22, elR: 20, wrist: 62, lean: 28 }] },
    machado: { g: G1, l: [
      [{ shRp: -165, shRr: -30, elR: 90, wrist: -65, twist: -35, lean: -6 }, { shRp: -55, shRr: -5, elR: 15, wrist: 85, lean: 30, twist: 20, crouch: 0.12, knL: 36 }, { shRp: -26, elR: 25, wrist: 70, lean: 26, twist: 28 }],
      [{ shRp: -80, shRr: -70, elR: 40, wrist: -20, twist: -46 }, { shRp: -90, shRr: 0, elR: 15, wrist: 40, twist: 25, lean: 10 }, { shRp: -80, shRr: 36, elR: 35, twist: 40 }]],
      p: [{ shRp: -176, shRr: -15, elR: 60, wrist: -70, lean: -10 }, { shRp: -45, elR: 5, wrist: 90, lean: 36, crouch: 0.16, knL: 42 }, { shRp: -16, elR: 15, wrist: 70, lean: 34 }] },
    lanca: { g: GS, l: [
      [{ shRp: -50, elR: 96, wrist: 85, twist: -30, lean: 4 }, { shRp: -88, elR: 5, wrist: 88, twist: 5, lean: 28, crouch: 0.14, knL: 42 }, { shRp: -85, elR: 10, wrist: 88, lean: 26 }],
      [{ shRp: -80, elR: 110, wrist: 70, twist: -30, lean: 0 }, { shRp: -110, elR: 10, wrist: 80, twist: 8, lean: 18 }, { shRp: -105, elR: 15, wrist: 80, lean: 16 }]],
      p: [{ shRp: -45, elR: 122, wrist: 85, twist: -42, lean: -4, crouch: 0.12 }, { shRp: -92, elR: 0, wrist: 90, twist: 15, lean: 36, crouch: 0.2, knL: 55, knR: 10 }, { shRp: -88, elR: 5, wrist: 90, twist: 12, lean: 32, crouch: 0.18 }] },
    duas: { g: G2, l: [
      [{ shRp: -170, elR: 70, wrist: -60, lean: -8, twist: -10 }, { shRp: -60, elR: 10, wrist: 85, lean: 34, crouch: 0.15, knL: 40 }, { shRp: -26, elR: 20, wrist: 70, lean: 32 }],
      [{ shRp: -85, shRr: -70, elR: 40, wrist: 0, twist: -56 }, { shRp: -90, shRr: 5, elR: 15, wrist: 40, twist: 30, lean: 10 }, { shRp: -80, shRr: 36, elR: 30, twist: 50 }]],
      p: [{ shRp: -178, elR: 55, wrist: -70, lean: -12, twist: -14, crouch: 0.02 }, { shRp: -55, elR: 0, wrist: 90, lean: 40, crouch: 0.18, knL: 46, knR: 34 }, { shRp: -18, elR: 12, wrist: 72, lean: 36 }] },
  };
  B.clava = B.machado; // (the club and the hammer swing as the axe does — G.Combate.MOVES names the axe's gestures for them)
  for (const cls of ['punho', 'faca', 'espada', 'machado', 'lanca', 'duas']) {
    const T = B[cls]; T.l.forEach((k, i) => blow(`cb-${cls}-${i + 1}`, cls, i, T.g, k[0], k[1], k[2]));
    blow(`cb-${cls}-p`, cls, -1, T.g, T.p[0], T.p[1], T.p[2], { in: 0.04 });
    charge(`cb-${cls}-carga`, cls, T.g, T.p[0]);
    // (the world's people: the first light blow, on the world's clock — and on the body's, for one fighting it)
    world(`cb-mundo-${cls}`, cls, T.g, T.l[0][0], T.l[0][1], T.l[0][2], 1.1, null);
    world(`cb-corpo-${cls}`, cls, T.g, T.l[0][0], T.l[0][1], T.l[0][2], 1.1 * TIME, null);
  }
  // ------------------------------ the guard ------------------------------
  // (held while the key is: the top of the body only — the feet walk under it, slowly; the shield up before the face, the blade
  // across, the fists up)
  const guard = (id, k, two) => add(id, { dur: 1.6, mask: 'upper', in: 0.08, out: 0.18, item: two === null ? null : { hand: 'mao', two: !!two }, events: { contact: 0.5 }, acts: id === 'cb-guarda-arma' ? ['guarda'] : null,
    keys: keysOf([[0, k], [0.5, mix(k, { lean: (k.lean || 0) + 1.5, neck: (k.neck || 0) + 1 })], [1, k]]) });
  guard('cb-guarda-escudo', { shLp: -78, shLr: 16, elL: 98, gripL: 1, shRp: -50, shRr: -25, elR: 92, wrist: 10, grip: 1, lean: 12, neck: 8, twist: 6, tool: 1 }, false);
  guard('cb-guarda-arma', { shRp: -72, shRr: 12, elR: 102, wrist: -22, grip: 1, shLp: -52, shLr: 16, elL: 100, gripL: 0.7, lean: 8, neck: 4, twist: -6, tool: 1 }, false);
  guard('cb-guarda-duas', { shRp: -72, shRr: -10, elR: 88, wrist: 25, grip: 1, gripL: 1, offW: 1, shLp: -50, elL: 90, lean: 10, neck: 4, twist: -10, tool: 1 }, true);
  guard('cb-guarda-punho', { shRp: -66, shRr: -8, elR: 132, shLp: -68, shLr: 10, elL: 132, grip: 1, gripL: 1, lean: 12, neck: 10, twist: -6, tool: 0 }, null);
  // ------------------------------ the bow ------------------------------
  // (the bow in the other hand, its arm out straight before the body; the hand that draws on the string — at rest at the bow,
  // drawn back to the jaw, let go)
  const BOW = { shLp: -88, shLr: 4, elL: 4, gripL: 1, shRp: -86, shRr: -4, elR: 28, grip: 0.7, lean: 4, twist: 14, neck: 2, tool: 0 };
  add('cb-arco-mirar', { dur: 2, mask: 'upper', in: 0.2, out: 0.25, events: { contact: 0.5 }, acts: ['mirar'], keys: keysOf([[0, BOW], [0.5, mix(BOW, { lean: 5 })], [1, BOW]]) });
  const DRAWN = mix(BOW, { shRp: -84, shRr: -22, elR: 146, grip: 1, twist: 20 });
  add('cb-arco-puxar', { dur: 2, mask: 'upper', in: 0.55, out: 0.12, events: { contact: 0.5 }, keys: keysOf([[0, DRAWN], [0.5, mix(DRAWN, { elR: 148, lean: 5 })], [1, DRAWN]]) });
  add('cb-arco-soltar', { dur: 0.38, loop: false, mask: 'upper', in: 0.02, out: 0.2, events: { contact: 0.08 }, keys: keysOf([[0, DRAWN], [0.08, mix(DRAWN, { shRr: -40, elR: 120, grip: 0 })], [0.4, mix(DRAWN, { shRr: -34, elR: 110, grip: 0.2 })], [1, BOW]]) });
  // (the world's archers: drawn over most of the wait, loosed at the world's own shot — war.js's 1.3 to 1.7 s; a loop)
  add('cb-arco-mundo', { dur: 1.7, period: 1.7, mask: 'upper', in: 0.2, out: 0.25, events: { contact: 0.6 }, acts: ['shoot'],
    keys: keysOf([[0, BOW], [0.2, BOW], [0.5, DRAWN], [0.6, mix(DRAWN, { shRr: -40, elR: 120, grip: 0 })], [0.75, mix(BOW, { elR: 40 })], [1, BOW]]) });
  // ------------------------------ the jolt of a blow taken ------------------------------
  // (thrown back: the trunk back, the head back and to the side, the arms come up — held as long as the jolt lasts, the world's
  // v.stagT; its coming in is quick and its going slow)
  add('cb-tranco', { dur: 0.8, mask: 'full', feet: 'plant', in: 0.05, out: 0.3, events: { contact: 0.2 },
    keys: keysOf([[0, { lean: -20, neck: -24, twist: 12, shRp: -40, shLp: -46, shRr: -20, shLr: 22, elR: 70, elL: 76, crouch: 0.1, knL: 26, knR: 30, sway: 8 }], [0.5, { lean: -14, neck: -16, twist: 6, shRp: -32, shLp: -36, shRr: -18, shLr: 20, elR: 64, elL: 70, crouch: 0.08, knL: 22, knR: 26, sway: 4 }], [1, { lean: -20, neck: -24, twist: 12, shRp: -40, shLp: -46, shRr: -20, shLr: 22, elR: 70, elL: 76, crouch: 0.1, knL: 26, knR: 30, sway: 8 }]]) });

  // ------------------------------ the world's fights, drawn with these ------------------------------
  // (the gesture of the weapon in the hands for the act the world gives — a person fighting, the one fighting the body on its
  // clock —; a jolt the world gave, a throw down by a blow: only read, nothing kept in the person)
  const A = G.Anim3D; if (!A || !A.stateOf) return;
  const memo = new Map(); G.worldHooks.push(() => memo.clear());
  const clsOf = v => { let m = memo.get(v.id); if (!m) { m = {}; memo.set(v.id, m); if (memo.size > 400) { const k = memo.keys().next().value; memo.delete(k); } } const h = G.Inv && G.Inv.heldFor ? G.Inv.heldFor(v, m) : null; return h && G.Combate ? G.Combate.classOf(h.mao) : 'espada'; };
  const vsBody = v => { const S = G.S; const id = S.avatar && S.avatar.id; const t = v.task; return !!(id && t && ((t.type === 'combat' && t.id === id) || (t.type === 'band' && t.foe === id))); };
  const stateOf0 = A.stateOf;
  A.stateOf = function (v, sp) {
    const s = stateOf0(v, sp); const S = G.S;
    if (v.downT > S.clock && !v.sleeping && s === 'sleep') return 'knocked'; // (thrown down by a blow — not lying down to sleep)
    if (v.stagT > S.clock && sp < 0.6 && s !== 'sleep' && s !== 'swim') return 'cb-tranco';
    if (s === 'fight' && v.act === 'fight' && !(v.task && v.task.type === 'drill')) return (vsBody(v) ? 'cb-corpo-' : 'cb-mundo-') + clsOf(v);
    return s;
  };
  A.stateOf.combate = true; // (for the proofs: the drawing asks the fight's gestures)
})(window.G);
