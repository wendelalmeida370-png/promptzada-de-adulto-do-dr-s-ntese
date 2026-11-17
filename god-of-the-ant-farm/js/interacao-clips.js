'use strict';
// ============================================================
//  The interaction's gestures (20e, D-404): the clips of the hands
//  at the things about the body — a stoop to pick up what lies on
//  the ground, the knuckles at a door, a lid lifted, a thing held
//  out to someone. Only seen: each is a clip of the one animator
//  (G.ANIM_CLIPS, the guide in JOGABILIDADE.md §4.6), played as the
//  body's act (Avatar.act's anim) in the act's own time; what the
//  act does to the world is its op, at its contact, in the world's
//  step (interact.js). Their contact is the act's: the stoop takes
//  the thing at half its second, the knock is heard at its first
//  blow. No item of their own: what the hand holds is G.Inv.held's.
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  // (a stoop: the knees and the back bend, the right hand goes down to the ground before the feet and closes at the contact,
  // and the body comes up with it; the left hand on the knee)
  Q.push(['apanhar', { dur: 1.0, loop: false, in: 0.12, out: 0.25, events: { contact: 0.5 }, acts: ['apanhar'],
    keys: {
      crouch: [[0, 0], [0.35, 0.3], [0.55, 0.32], [0.85, 0.08], [1, 0]], lean: [[0, 4], [0.35, 48], [0.55, 52], [0.85, 14], [1, 4]], neck: [[0, 6], [0.45, 24], [1, 6]],
      hipL: [[0, 0], [0.4, -50], [0.6, -52], [1, 0]], hipR: [[0, 0], [0.4, -38], [0.6, -40], [1, 0]], knL: [[0, 4], [0.4, 72], [0.6, 74], [1, 4]], knR: [[0, 4], [0.4, 58], [0.6, 60], [1, 4]],
      shRp: [[0, -10], [0.35, -62], [0.5, -70], [0.7, -40], [1, -10]], shRr: [[0, -8], [0.5, -4], [1, -8]], elR: [[0, 20], [0.35, 10], [0.5, 8], [0.75, 45], [1, 20]],
      wrist: [[0, 0], [0.45, 25], [0.7, 10], [1, 0]], grip: [[0, 0.15], [0.45, 0.2], [0.52, 0.95], [1, 0.8]],
      shLp: [[0, -5], [0.4, -40], [0.6, -42], [1, -5]], elL: [[0, 15], [0.4, 60], [0.6, 60], [1, 15]], gripL: [[0, 0.4], [1, 0.4]],
    } }]);
  // (the knuckles at a door: the right arm up before the face, three knocks from the elbow — the first heard at the contact —,
  // the head a little to the door, listening after)
  Q.push(['bater', { dur: 1.15, loop: false, mask: 'upper', in: 0.15, out: 0.3, events: { contact: 0.48 }, acts: ['bater'],
    keys: {
      shRp: [[0, -20], [0.25, -82], [0.8, -80], [1, -20]], shRr: [[0, -8], [0.25, -14], [1, -8]],
      elR: [[0, 30], [0.25, 112], [0.36, 92], [0.42, 112], [0.48, 90], [0.56, 112], [0.62, 90], [0.7, 112], [0.85, 105], [1, 30]],
      wrist: [[0, 0], [0.25, -10], [1, 0]], grip: [[0, 0.3], [0.2, 0.95], [0.85, 0.95], [1, 0.3]],
      lean: [[0, 2], [0.4, 6], [1, 2]], neck: [[0, 0], [0.5, 6], [0.9, 10], [1, 0]], lookY: [[0, 0], [0.8, 7], [1, 0]],
    } }]);
  // (a lid lifted: a little stoop, both hands under the lid's edge, up at the contact — then the eye on what is inside)
  Q.push(['abrir', { dur: 0.8, loop: false, in: 0.12, out: 0.3, events: { contact: 0.55 }, acts: ['abrir'],
    keys: {
      crouch: [[0, 0], [0.4, 0.12], [0.7, 0.1], [1, 0.04]], lean: [[0, 4], [0.4, 32], [0.7, 26], [1, 18]], neck: [[0, 6], [0.6, 22], [1, 18]],
      knL: [[0, 4], [0.4, 26], [1, 12]], knR: [[0, 4], [0.4, 24], [1, 12]],
      shRp: [[0, -10], [0.4, -55], [0.6, -78], [1, -48]], shLp: [[0, -10], [0.4, -55], [0.6, -78], [1, -48]],
      shRr: [[0, -6], [0.4, -2], [1, -6]], shLr: [[0, 6], [0.4, 2], [1, 6]], elR: [[0, 20], [0.4, 30], [0.6, 50], [1, 40]], elL: [[0, 20], [0.4, 30], [0.6, 50], [1, 40]],
      grip: [[0, 0.2], [0.45, 0.8], [0.7, 0.7], [1, 0.3]], gripL: [[0, 0.2], [0.45, 0.8], [0.7, 0.7], [1, 0.3]],
    } }]);
  // (seated by the fire on the ground: both hands held out to it, palms open, rubbed now and then, the head a little bowed to
  // the warmth — the pose of the place's use «aquecer», the body's own; the world's place is the plan's)
  Q.push(['aquecer', { dur: 4.2, base: 'rest', mask: 'upper', in: 0.4, out: 0.4, events: { contact: 0.5 }, acts: ['aquecer'],
    keys: {
      shRp: [[0, -62], [0.3, -66], [0.42, -58], [0.5, -64], [0.58, -58], [0.7, -66], [1, -62]], shLp: [[0, -62], [0.3, -66], [0.42, -58], [0.5, -64], [0.58, -58], [0.7, -66], [1, -62]],
      shRr: [[0, -6], [0.42, -14], [0.58, -14], [1, -6]], shLr: [[0, 6], [0.42, 14], [0.58, 14], [1, 6]],
      elR: [[0, 26], [0.42, 48], [0.5, 40], [0.58, 48], [1, 26]], elL: [[0, 26], [0.42, 48], [0.5, 40], [0.58, 48], [1, 26]],
      wrist: [[0, -18], [1, -18]], wristL: [[0, -18], [1, -18]], grip: [[0, 0.05], [0.45, 0.35], [0.55, 0.35], [1, 0.05]], gripL: [[0, 0.05], [0.45, 0.35], [0.55, 0.35], [1, 0.05]],
      lean: [[0, 14], [0.5, 18], [1, 14]], neck: [[0, 10], [0.5, 14], [1, 10]],
    } }]);
  // (seated to read: the scroll held open before the chest in both hands, the head bent to it, the eyes along the lines — a hand
  // turns it on now and then)
  Q.push(['ler', { dur: 6, base: 'sit', mask: 'upper', in: 0.4, out: 0.4, events: { contact: 0.5 }, acts: ['ler'],
    keys: {
      shRp: [[0, -42], [0.6, -42], [0.7, -50], [0.8, -42], [1, -42]], shLp: [[0, -42], [1, -42]], shRr: [[0, -18], [1, -18]], shLr: [[0, 18], [1, 18]],
      elR: [[0, 92], [0.6, 92], [0.7, 80], [0.8, 92], [1, 92]], elL: [[0, 92], [1, 92]], wrist: [[0, -12], [0.7, 6], [1, -12]], wristL: [[0, -12], [1, -12]],
      grip: [[0, 0.7], [1, 0.7]], gripL: [[0, 0.7], [1, 0.7]], lean: [[0, 10], [1, 10]], neck: [[0, 28], [0.3, 30], [0.6, 26], [1, 28]], lookY: [[0, -4], [0.5, 4], [1, -4]],
    } }]);
  // (a thing held out to someone: the arm forward from the shoulder, the hand opens at the contact, a little bow of the head)
  Q.push(['dar', { dur: 1.1, loop: false, mask: 'upper', in: 0.15, out: 0.3, events: { contact: 0.55 }, acts: ['dar'],
    keys: {
      shRp: [[0, -12], [0.45, -72], [0.65, -70], [1, -12]], shRr: [[0, -8], [0.45, -16], [1, -8]], elR: [[0, 35], [0.45, 22], [0.65, 28], [1, 35]],
      wrist: [[0, 0], [0.45, -18], [0.65, -10], [1, 0]], grip: [[0, 0.9], [0.5, 0.9], [0.6, 0.1], [1, 0.2]],
      lean: [[0, 2], [0.5, 10], [1, 2]], neck: [[0, 0], [0.55, 12], [1, 0]],
    } }]);
})(window.G);
