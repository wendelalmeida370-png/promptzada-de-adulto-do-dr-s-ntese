'use strict';
// ============================================================
//  The gestures of the trades (20g, D-428): clips of the body's
//  animator (G.ANIM_CLIPS, JOGABILIDADE.md §4.6) — the felling
//  stroke of the axe brought down from over the shoulder with both
//  hands, the pick driven into the stone, the sickle through the
//  stalks, the rod cast and watched and struck, the net thrown and
//  hauled, the spear poised over the water and thrust, the hands
//  in the shallows, the knife at the hide, the berries plucked, the
//  spade and the bare hands at the bank, the seller's call. Each
//  one the same for the body the player lives and for the people
//  of the world doing the same work (the acts it takes: chop, cut,
//  mine, harvest), its contact on the world's own stroke (period:
//  the world's seconds of one; the body's act warps it, D-343).
//  Only seen: nothing here reads or writes the world (rule 113).
// ============================================================
(function (G) {
  const K = (id, def) => (G.ANIM_CLIPS = G.ANIM_CLIPS || []).push([id, def]);
  const ON = [[0, 1], [1, 1]];
  // ------------------------------ the axe ------------------------------
  // (the felling stroke: the feet wide, the left ahead; the axe raised high over the right shoulder with both hands — the trunk
  // wound to the right, the weight back, the head of the axe behind the head —, a breath held at the top; then down and across
  // in a third of the time, the weight thrown onto the front foot, the trunk bowing and unwinding to the left, the knees giving;
  // the blade bites at the waist, the haft shudders, and it is wrenched out and brought back low — both hands on the haft all
  // the way. One stroke a cycle: the world's woodcutter strikes every 0.55 s of the world)
  K('machado', { dur: 1.6, period: 0.55, stance: [0.2, 0.17, -0.12], item: { hand: 'mao', two: true }, events: { contact: 0.62 }, in: 0.18, out: 0.3, takes: ['chop', 'cut'],
    keys: {
      // (the keys dense round the bite: the curve through them does not overshoot — the axe stays in the wood, it does not fall through)
      shRp: [[0, -62], [0.12, -84], [0.28, -140], [0.4, -150], [0.48, -152], [0.55, -118], [0.58, -96], [0.6, -82], [0.61, -76], [0.62, -73], [0.64, -72], [0.68, -71], [0.74, -68], [0.82, -64], [0.9, -62], [1, -62]],
      shRr: [[0, 4], [0.3, -18], [0.44, -22], [0.5, -24], [0.56, -12], [0.59, 0], [0.61, 8], [0.62, 10], [0.63, 11], [0.65, 11], [0.7, 10], [0.8, 7], [1, 4]],
      elR: [[0, 26], [0.12, 52], [0.28, 80], [0.4, 88], [0.48, 88], [0.55, 58], [0.58, 36], [0.6, 24], [0.61, 20], [0.62, 18], [0.64, 18], [0.68, 18], [0.74, 20], [0.82, 24], [1, 26]],
      // (the blade into the trunk at 45°, from above, at the height of the chest — the notch's top cut —, held there a moment, and
      // wrenched out)
      wrist: [[0, 32], [0.15, 10], [0.3, -30], [0.4, -50], [0.48, -55], [0.55, -18], [0.58, 6], [0.6, 20], [0.61, 26], [0.62, 29], [0.64, 30], [0.68, 30], [0.8, 31], [1, 32]],
      shLp: [[0, -64], [0.12, -86], [0.28, -138], [0.4, -146], [0.48, -148], [0.55, -114], [0.58, -95], [0.6, -82], [0.61, -76], [0.62, -73], [0.64, -72], [0.68, -71], [0.74, -68], [0.84, -65], [1, -64]],
      shLr: [[0, 2], [0.3, -26], [0.44, -34], [0.5, -34], [0.56, -16], [0.59, -4], [0.61, 4], [0.62, 6], [0.64, 7], [0.7, 6], [0.8, 4], [1, 2]],
      elL: [[0, 22], [0.28, 74], [0.4, 82], [0.48, 82], [0.55, 54], [0.58, 34], [0.6, 22], [0.61, 18], [0.62, 16], [0.64, 16], [0.68, 16], [0.74, 18], [0.84, 20], [1, 22]],
      gripL: ON,
      lean: [[0, 16], [0.2, 6], [0.4, -8], [0.48, -10], [0.56, 6], [0.6, 18], [0.62, 22], [0.64, 23], [0.7, 23], [0.82, 19], [1, 16]],
      twist: [[0, 8], [0.25, -18], [0.42, -38], [0.5, -40], [0.56, -18], [0.6, 6], [0.62, 12], [0.64, 13], [0.72, 12], [0.86, 9], [1, 8]],
      crouch: [[0, 0.05], [0.3, 0.02], [0.46, 0.01], [0.56, 0.05], [0.6, 0.1], [0.62, 0.11], [0.66, 0.11], [0.74, 0.09], [1, 0.05]],
      shift: [[0, 0], [0.4, -0.03], [0.5, -0.035], [0.62, 0.035], [0.8, 0.02], [1, 0]],
      knL: [[0, 14], [0.4, 6], [0.5, 6], [0.62, 28], [0.75, 24], [1, 14]], knR: [[0, 12], [0.4, 18], [0.5, 19], [0.62, 16], [1, 12]],
      neck: [[0, 18], [0.4, 4], [0.5, 2], [0.62, 22], [0.75, 22], [1, 18]],
      offW: ON, grip: ON, tool: ON,
    } });
  // ------------------------------ the pick ------------------------------
  // (the pick at the stone: both hands on the haft, swung up straight over the head — the back arched, up on the toes a little —
  // and driven down before the feet, the back bowed deep and the knees bent, the head of the pick into the rock; worked free
  // with a pull back and lifted again. One stroke a cycle: the quarryman's 0.6 s of the world)
  K('picareta', { dur: 1.7, period: 0.6, stance: [0.18, 0.12, -0.08], item: { hand: 'mao', two: true }, events: { contact: 0.6 }, in: 0.18, out: 0.3, takes: ['mine'],
    keys: {
      shRp: [[0, -40], [0.15, -80], [0.34, -158], [0.44, -176], [0.5, -172], [0.56, -110], [0.6, -38], [0.66, -32], [0.8, -36], [1, -40]],
      shRr: [[0, -8], [0.44, -14], [0.6, -4], [1, -8]],
      elR: [[0, 26], [0.34, 70], [0.44, 62], [0.5, 60], [0.56, 30], [0.6, 6], [0.68, 10], [0.84, 22], [1, 26]],
      wrist: [[0, 55], [0.3, 10], [0.44, -40], [0.5, -44], [0.56, 10], [0.6, 74], [0.68, 70], [0.84, 60], [1, 55]],
      shLp: [[0, -44], [0.15, -82], [0.34, -150], [0.44, -168], [0.5, -165], [0.56, -105], [0.6, -40], [0.68, -36], [1, -44]],
      shLr: [[0, -8], [0.44, -14], [0.6, -6], [1, -8]],
      elL: [[0, 22], [0.34, 66], [0.44, 58], [0.56, 28], [0.6, 6], [0.7, 10], [1, 22]], gripL: ON,
      lean: [[0, 30], [0.2, 16], [0.4, -8], [0.5, -10], [0.56, 12], [0.6, 42], [0.7, 40], [0.86, 32], [1, 30]],
      twist: [[0, 2], [0.44, -6], [0.6, 4], [1, 2]],
      crouch: [[0, 0.07], [0.4, -0.01], [0.5, -0.015], [0.6, 0.14], [0.72, 0.12], [1, 0.07]],
      knL: [[0, 18], [0.44, 4], [0.6, 34], [0.75, 30], [1, 18]], knR: [[0, 16], [0.44, 5], [0.6, 30], [1, 16]],
      anL: [[0, 0], [0.44, 8], [0.56, 0], [1, 0]], anR: [[0, 0], [0.44, 8], [0.56, 0], [1, 0]],
      neck: [[0, 28], [0.44, 6], [0.6, 36], [0.75, 34], [1, 28]],
      offW: ON, grip: ON, tool: ON,
    } });
  // ------------------------------ the sickle ------------------------------
  // (the harvest of a patch: bowed low over the stalks, the left hand gathering a fistful and holding it, the right drawing the
  // sickle through from right to left at their foot — twice, the second cut the one that frees the sheaf — and lifting the
  // sheaf aside; the farmer's patch in 1.5 s of the world)
  K('ceifar', { dur: 2.2, period: 1.5, stance: [0.2, 0.1, -0.1], item: { hand: 'mao' }, events: { contact: 0.82 }, in: 0.22, out: 0.3, takes: ['harvest'],
    keys: {
      crouch: [[0, 0.2], [0.4, 0.24], [0.82, 0.25], [1, 0.2]], lean: [[0, 44], [0.3, 52], [0.5, 48], [0.82, 54], [0.92, 40], [1, 44]],
      hipL: [[0, -40], [1, -40]], hipR: [[0, -30], [1, -30]], knL: [[0, 52], [0.82, 58], [1, 52]], knR: [[0, 44], [0.82, 50], [1, 44]],
      neck: [[0, 22], [0.82, 28], [1, 22]],
      // (the left hand: down into the stalks and closed on them, the sheaf lifted aside at the end)
      shLp: [[0, -55], [0.12, -72], [0.3, -70], [0.82, -68], [0.92, -95], [1, -55]], shLr: [[0, 14], [0.12, 6], [0.82, 4], [0.92, 22], [1, 14]],
      elL: [[0, 40], [0.12, 22], [0.82, 24], [0.92, 70], [1, 40]], gripL: [[0, 0.3], [0.14, 1], [0.9, 1], [0.96, 0.3], [1, 0.3]],
      // (the right: the sickle back out to the right, then through to the left — and again)
      shRp: [[0, -55], [0.2, -62], [0.38, -70], [0.5, -58], [0.66, -62], [0.82, -72], [0.92, -55], [1, -55]],
      shRr: [[0, -30], [0.2, -48], [0.38, -4], [0.5, -42], [0.66, -50], [0.82, -2], [0.92, -22], [1, -30]],
      elR: [[0, 40], [0.2, 30], [0.38, 34], [0.5, 30], [0.66, 28], [0.82, 32], [0.92, 50], [1, 40]],
      wrist: [[0, 10], [0.2, -20], [0.38, 40], [0.5, -20], [0.66, -25], [0.82, 42], [0.92, 20], [1, 10]],
      twist: [[0, -4], [0.2, -18], [0.38, 14], [0.5, -16], [0.66, -20], [0.82, 16], [0.92, 4], [1, -4]],
      grip: ON, tool: ON,
    } });
  // ------------------------------ the berries ------------------------------
  // (a load of berries off a bush: bent at the hips and the knees, the right hand reaching in, plucking and dropping into the
  // left held cupped before the belly — three times —, the last handful pressed down: one load in the picker's 2.2 s of the world)
  K('colher-mato', { dur: 2.4, loop: false, stance: [0.15, 0.06, -0.06], events: { contact: 0.9 }, in: 0.2, out: 0.3,
    keys: {
      crouch: [[0, 0.1], [1, 0.12]], lean: [[0, 26], [0.15, 34], [0.3, 28], [0.48, 36], [0.62, 28], [0.8, 34], [0.9, 30], [1, 24]], neck: [[0, 16], [1, 18]],
      knL: [[0, 22], [1, 24]], knR: [[0, 18], [1, 20]],
      shRp: [[0, -40], [0.12, -78], [0.2, -70], [0.3, -48], [0.42, -80], [0.52, -70], [0.62, -48], [0.74, -82], [0.84, -70], [0.92, -48], [1, -40]],
      shRr: [[0, -12], [0.12, -24], [0.3, -4], [0.42, -20], [0.62, -4], [0.74, -26], [0.92, -4], [1, -12]],
      elR: [[0, 50], [0.12, 18], [0.2, 26], [0.3, 70], [0.42, 16], [0.52, 26], [0.62, 70], [0.74, 18], [0.84, 26], [0.92, 72], [1, 50]],
      grip: [[0, 0.3], [0.14, 0.1], [0.2, 0.9], [0.3, 0.6], [0.34, 0.2], [0.44, 0.1], [0.52, 0.9], [0.62, 0.6], [0.66, 0.2], [0.76, 0.1], [0.84, 0.9], [0.94, 0.6], [1, 0.3]],
      shLp: [[0, -40], [1, -42]], shLr: [[0, 10], [1, 10]], elL: [[0, 70], [1, 72]], gripL: [[0, 0.5], [1, 0.5]],
      twist: [[0, 0], [0.12, -8], [0.3, 6], [0.42, -10], [0.62, 6], [0.74, -6], [0.92, 6], [1, 0]],
    } });
  // ------------------------------ the knife at a carcass ------------------------------
  // (skinning a kill: down on one knee beside it, the left hand holding the hide back, the knife in short drawing cuts along the
  // belly and the legs — six of them —, the last long pull that takes the hide off; the hunter's 4 of work)
  K('esfolar', { dur: 4.2, loop: false, base: 'idle', feet: 'free', item: { hand: 'mao' }, events: { contact: 0.94 }, in: 0.35, out: 0.4,
    keys: {
      crouch: [[0, 0.48], [1, 0.48]], lean: [[0, 38], [0.5, 46], [0.94, 30], [1, 34]], neck: [[0, 30], [0.94, 24], [1, 28]],
      hipL: [[0, -95], [1, -95]], knL: [[0, 110], [1, 110]], hipR: [[0, 10], [1, 10]], knR: [[0, 115], [1, 115]], anR: [[0, -30], [1, -30]],
      shRp: [[0, -60], [0.07, -75], [0.14, -40], [0.21, -75], [0.28, -40], [0.36, -75], [0.43, -40], [0.5, -75], [0.57, -40], [0.65, -75], [0.72, -40], [0.84, -82], [0.94, -30], [1, -50]],
      shRr: [[0, -14], [0.14, -6], [0.5, -10], [0.94, -4], [1, -12]],
      elR: [[0, 70], [0.07, 85], [0.14, 40], [0.21, 85], [0.28, 40], [0.36, 85], [0.43, 40], [0.5, 85], [0.57, 40], [0.65, 85], [0.72, 40], [0.84, 95], [0.94, 50], [1, 66]],
      wrist: [[0, 60], [0.07, 40], [0.14, 95], [0.21, 40], [0.28, 95], [0.36, 40], [0.43, 95], [0.5, 40], [0.57, 95], [0.65, 40], [0.72, 95], [0.84, 30], [0.94, 90], [1, 60]],
      shLp: [[0, -55], [0.5, -50], [0.86, -60], [0.94, -90], [1, -55]], shLr: [[0, 18], [0.94, 24], [1, 18]], elL: [[0, 35], [0.5, 45], [0.86, 30], [0.94, 80], [1, 35]],
      gripL: [[0, 0.9], [1, 0.9]], grip: ON, tool: ON, twist: [[0, 4], [0.14, -6], [0.5, 4], [0.94, -10], [1, 4]],
    } });
  // ------------------------------ the spade, and the bare hands, at the bank ------------------------------
  // (the clay dug: the blade driven in with the foot's weight, levered back, the load lifted and thrown onto the pile — four times
  // in the potter's 5 s of the world)
  const dig = (u0, u1) => { const d = u1 - u0, k = []; for (const [f, sp, el, wr, ln, tw, cr] of [[0, -40, 45, -100, 25, 0, 0.06], [0.18, -55, 55, -95, 20, -4, 0.07], [0.3, -18, 25, -95, 40, -6, 0.12], [0.42, -22, 30, -90, 30, -6, 0.1], [0.55, -50, 60, -70, 12, 4, 0.05], [0.72, -95, 80, -40, 18, 30, 0.04], [0.84, -85, 70, -55, 20, 18, 0.05]]) k.push([u0 + f * d, sp, el, wr, ln, tw, cr]); return k; };
  const reps = (fn, n, end) => { const out = []; for (let i = 0; i < n; i++) out.push(...fn(i / n * end, (i + 1) / n * end)); return out; };
  const chan = (rows, j, tail) => rows.map(r => [r[0], r[j]]).concat(tail ? [tail] : []);
  { const R = reps(dig, 4, 0.96);
    K('pa', { dur: 8, loop: false, stance: [0.15, 0.12, -0.05], item: { hand: 'mao', two: true }, events: { contact: 0.92 }, in: 0.25, out: 0.35,
      keys: { shRp: chan(R, 1, [1, -40]), elR: chan(R, 2, [1, 45]), wrist: chan(R, 3, [1, -100]), lean: chan(R, 4, [1, 25]), twist: chan(R, 5, [1, 0]), crouch: chan(R, 6, [1, 0.06]),
        shRr: [[0, -12], [1, -12]], knL: [[0, 16], [1, 16]], knR: [[0, 18], [1, 18]], neck: [[0, 30], [1, 30]], offW: ON, grip: ON, tool: ON } }); }
  // (the bare hands: crouched at the edge, scooping the wet earth with both hands and pressing it into a lump — five times)
  { const R = reps((u0, u1) => { const d = u1 - u0; return [[u0, -50, 30, 0.3], [u0 + 0.35 * d, -78, 12, 0.1], [u0 + 0.6 * d, -70, 20, 1], [u0 + 0.85 * d, -45, 70, 0.9]]; }, 5, 0.96);
    K('cavar-maos', { dur: 6, loop: false, base: 'idle', feet: 'free', events: { contact: 0.92 }, in: 0.3, out: 0.35,
      keys: { shRp: chan(R, 1, [1, -50]), shLp: chan(R, 1, [1, -50]), elR: chan(R, 2, [1, 30]), elL: chan(R, 2, [1, 30]), grip: chan(R, 3, [1, 0.3]), gripL: chan(R, 3, [1, 0.3]),
        crouch: [[0, 0.42], [1, 0.42]], lean: [[0, 40], [1, 40]], neck: [[0, 30], [1, 30]], hipL: [[0, -80], [1, -80]], hipR: [[0, -70], [1, -70]], knL: [[0, 105], [1, 105]], knR: [[0, 100], [1, 100]],
        shRr: [[0, -10], [1, -10]], shLr: [[0, 10], [1, 10]] } }); }
  // ------------------------------ fishing ------------------------------
  // (the rod: drawn back over the right shoulder and cast forward from the elbow — the line out —, then held low before the body
  // with both hands, the tip twitched now and then while the line is watched; at the bite, struck up hard and lifted: the
  // world's cast of the line, its contact the bite at 92% of it)
  K('vara', { dur: 6.5, loop: false, stance: [0.14, 0.1, -0.05], item: { hand: 'mao', two: true }, events: { contact: 0.92 }, in: 0.2, out: 0.35,
    keys: {
      shRp: [[0, -60], [0.05, -125], [0.09, -132], [0.13, -58], [0.18, -46], [0.45, -44], [0.5, -52], [0.54, -44], [0.75, -45], [0.8, -50], [0.84, -45], [0.89, -48], [0.92, -105], [0.97, -96], [1, -80]],
      elR: [[0, 50], [0.05, 100], [0.09, 108], [0.13, 40], [0.18, 52], [0.45, 55], [0.5, 62], [0.54, 55], [0.89, 56], [0.92, 92], [1, 80]],
      wrist: [[0, 0], [0.05, -55], [0.09, -62], [0.13, 30], [0.18, 12], [0.45, 10], [0.5, -4], [0.54, 10], [0.89, 10], [0.92, -40], [1, -25]],
      shRr: [[0, -14], [1, -14]], lean: [[0, 4], [0.09, -6], [0.13, 12], [0.2, 8], [0.89, 8], [0.92, -10], [1, -6]],
      neck: [[0, 10], [0.15, 18], [0.89, 20], [0.92, 6], [1, 10]], twist: [[0, -4], [0.09, -16], [0.13, 6], [0.25, 0], [0.89, 0], [0.92, -8], [1, -4]],
      crouch: [[0, 0.03], [0.89, 0.04], [0.92, 0.07], [1, 0.05]], knL: [[0, 10], [0.92, 18], [1, 14]], knR: [[0, 12], [0.92, 20], [1, 16]],
      offW: [[0, 0.4], [0.13, 0.4], [0.2, 1], [1, 1]], grip: ON, tool: ON,
    } });
  // (the net: gathered over the left arm, the body wound to the right, swung and thrown out with both arms — the net opens over
  // the water —, the rope held while it sinks, then hauled in hand over hand, leaning back, and lifted: the world's cast of the
  // net, its contact the haul at 91% of it)
  { const pull = []; for (let i = 0; i < 6; i++) { const u = 0.74 + i * 0.03; pull.push([u, i % 2 ? -40 : -80, i % 2 ? -80 : -40]); }
    K('rede', { dur: 7.5, loop: false, stance: [0.2, 0.12, -0.1], item: { hand: 'mao', two: true }, events: { contact: 0.91 }, in: 0.25, out: 0.35,
      keys: {
        shRp: [[0, -40], [0.08, -55], [0.16, -70], [0.22, -40], [0.27, -120], [0.32, -60], [0.7, -50], ...pull.map(p => [p[0], p[1]]), [0.92, -70], [0.97, -100], [1, -60]],
        shLp: [[0, -60], [0.08, -70], [0.16, -60], [0.22, -30], [0.27, -110], [0.32, -55], [0.7, -50], ...pull.map(p => [p[0], p[2]]), [0.92, -60], [0.97, -95], [1, -55]],
        shRr: [[0, -10], [0.16, -40], [0.22, -50], [0.27, -10], [1, -10]], shLr: [[0, 20], [0.16, 0], [0.22, -10], [0.27, 20], [1, 15]],
        elR: [[0, 50], [0.16, 40], [0.22, 30], [0.27, 10], [0.32, 40], [0.7, 50], [0.92, 70], [1, 55]], elL: [[0, 70], [0.16, 60], [0.22, 40], [0.27, 10], [0.32, 40], [0.7, 50], [0.92, 70], [1, 55]],
        twist: [[0, 0], [0.16, -36], [0.22, -40], [0.27, 26], [0.34, 8], [0.7, 0], [1, 0]],
        lean: [[0, 20], [0.16, 10], [0.22, 6], [0.27, 22], [0.34, 10], [0.7, 6], [0.74, -6], [0.9, -12], [0.97, 10], [1, 8]],
        crouch: [[0, 0.08], [0.22, 0.1], [0.27, 0.04], [0.7, 0.04], [0.9, 0.08], [1, 0.05]], knL: [[0, 16], [0.27, 10], [0.9, 22], [1, 14]], knR: [[0, 18], [0.22, 24], [0.9, 18], [1, 14]],
        neck: [[0, 16], [0.27, 4], [0.4, 14], [1, 14]], offW: [[0, 0.6], [0.2, 0.6], [0.27, 0], [0.32, 0.3], [1, 0.3]], grip: ON, gripL: ON, tool: ON,
      } }); }
  // (the spear over the water: raised in both hands, the point down at the water before the feet, the body still and bowed over
  // it — a long while, the point following a shadow —; then thrust down hard, the weight going with it, and pulled up: the world's
  // try of the harpoon, its contact the thrust at 92% of it)
  K('lanca-agua', { dur: 5, loop: false, stance: [0.18, 0.14, -0.08], item: { hand: 'mao', two: true }, events: { contact: 0.92 }, in: 0.25, out: 0.35,
    keys: {
      shRp: [[0, -60], [0.12, -98], [0.18, -95], [0.5, -92], [0.6, -98], [0.75, -94], [0.86, -104], [0.92, -42], [0.97, -55], [1, -70]],
      elR: [[0, 60], [0.12, 110], [0.86, 116], [0.92, 12], [0.97, 30], [1, 60]], wrist: [[0, 20], [0.12, 62], [0.86, 66], [0.92, 55], [1, 40]],
      shRr: [[0, -10], [0.12, -22], [0.86, -24], [0.92, -6], [1, -10]],
      shLp: [[0, -55], [0.12, -72], [0.86, -76], [0.92, -38], [1, -60]], elL: [[0, 50], [0.12, 42], [0.86, 44], [0.92, 8], [1, 40]], gripL: ON,
      lean: [[0, 14], [0.12, 22], [0.5, 26], [0.86, 24], [0.92, 42], [0.97, 30], [1, 18]],
      twist: [[0, 0], [0.4, -4], [0.6, 4], [0.86, 0], [0.92, 6], [1, 0]], neck: [[0, 20], [0.12, 34], [0.86, 36], [0.92, 40], [1, 24]],
      crouch: [[0, 0.06], [0.12, 0.1], [0.86, 0.11], [0.92, 0.16], [1, 0.08]], knL: [[0, 16], [0.86, 24], [0.92, 34], [1, 18]], knR: [[0, 16], [0.86, 22], [0.92, 28], [1, 18]],
      offW: ON, grip: ON, tool: ON,
    } });
  // (the bare hands in the shallows: crouched deep, both hands slowly in the water before the knees, cupped, waiting; a quick
  // close at the fish that passes — the world's try of the hands, its contact the grab at 55% of it —, lifted)
  K('maos-agua', { dur: 2.2, loop: false, base: 'idle', feet: 'free', events: { contact: 0.55 }, in: 0.3, out: 0.35,
    keys: {
      crouch: [[0, 0.38], [0.5, 0.42], [0.58, 0.34], [1, 0.36]], lean: [[0, 44], [0.5, 50], [0.58, 30], [1, 40]], neck: [[0, 26], [0.5, 30], [0.58, 10], [1, 22]],
      hipL: [[0, -80], [1, -80]], hipR: [[0, -70], [1, -70]], knL: [[0, 100], [1, 100]], knR: [[0, 96], [1, 96]],
      shRp: [[0, -55], [0.25, -62], [0.5, -66], [0.56, -45], [0.7, -80], [1, -60]], shLp: [[0, -55], [0.25, -60], [0.5, -64], [0.56, -42], [0.7, -78], [1, -58]],
      shRr: [[0, -8], [0.5, -4], [0.56, 4], [1, -8]], shLr: [[0, 8], [0.5, 4], [0.56, -4], [1, 8]],
      elR: [[0, 22], [0.5, 14], [0.56, 34], [0.7, 80], [1, 30]], elL: [[0, 22], [0.5, 14], [0.56, 34], [0.7, 80], [1, 30]],
      grip: [[0, 0.3], [0.5, 0.2], [0.55, 1], [0.8, 0.9], [1, 0.4]], gripL: [[0, 0.3], [0.5, 0.2], [0.55, 1], [0.8, 0.9], [1, 0.4]],
    } });
  // ------------------------------ the stall ------------------------------
  // (the seller's call over the counter: the right hand cupped at the mouth, the head up, then the open hand sweeping over the
  // goods toward whoever passes — the top of the body only)
  K('apregoar', { dur: 3.4, loop: false, mask: 'upper', events: { contact: 0.35 }, in: 0.2, out: 0.3,
    keys: {
      shRp: [[0, -20], [0.12, -78], [0.4, -82], [0.52, -50], [0.7, -46], [0.85, -40], [1, -20]], shRr: [[0, -10], [0.12, -40], [0.4, -42], [0.52, -50], [0.7, -20], [0.85, -10], [1, -10]],
      elR: [[0, 30], [0.12, 138], [0.4, 140], [0.52, 40], [0.7, 30], [0.85, 30], [1, 30]], grip: [[0, 0.2], [0.12, 0.6], [0.4, 0.6], [0.52, 0.05], [1, 0.2]],
      shLp: [[0, -10], [0.5, -10], [0.62, -40], [0.8, -42], [1, -10]], shLr: [[0, 10], [0.62, 24], [0.8, 30], [1, 10]], elL: [[0, 20], [0.62, 40], [0.8, 30], [1, 20]],
      neck: [[0, 4], [0.12, -10], [0.4, -12], [0.55, 6], [1, 4]], twist: [[0, 0], [0.4, -4], [0.6, 10], [0.85, -6], [1, 0]],
      talk: [[0, 0], [0.14, 0.8], [0.2, 0.3], [0.26, 0.9], [0.32, 0.2], [0.38, 0.8], [0.44, 0.1], [0.6, 0.5], [0.66, 0.1], [1, 0]],
    } });
})(window.G);
