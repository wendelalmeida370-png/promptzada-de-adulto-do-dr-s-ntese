'use strict';
// ============================================================
//  The gestures of the scenes (22c onda 2, fase 5, D-607): the
//  child down on the knees at the house's dog, the hand along its
//  back; the soldier's drill — the thrust and the guard again, on
//  the world's clock of the drill (the stroke at 3.6 s of 4: the
//  'treinar' of act-servicos.js). The scene and its focus are the
//  reader's (vida3d.js, Vida3D.scene); only seen (rule 113); the
//  thing in the soldier's hand is the inventory's, or none.
// ============================================================
(function (G) {
  const Q = G.ANIM_CLIPS = G.ANIM_CLIPS || [];
  const K = (id, def) => { Q.push([id, def]); if (G.Anim3D && G.Anim3D.mirrorDef && !def.noMirror) Q.push([id + '~m', G.Anim3D.mirrorDef(def)]); };
  // the child at the dog: kneeling (the feet stretched back, as the prayer's), bent to it, the right hand stroking its back
  const KNEEL = { crouch: [[0, 0.45], [1, 0.45]], hipL: [[0, -6], [1, -6]], hipR: [[0, -6], [1, -6]], knL: [[0, 95], [1, 95]], knR: [[0, 95], [1, 95]], anL: [[0, 70], [1, 70]], anR: [[0, 70], [1, 70]] };
  K('crianca-cao', { dur: 3, base: 'idle', feet: 'free', mask: 'full', in: 0.45, out: 0.45, events: { contact: 0.5 },
    keys: Object.assign({}, KNEEL, {
      lean: [[0, 22], [0.5, 26], [1, 22]], neck: [[0, 18], [0.5, 22], [1, 18]],
      shRp: [[0, -44], [0.25, -36], [0.5, -50], [0.75, -36], [1, -44]], shRr: [[0, -6], [1, -6]], elR: [[0, 26], [0.25, 18], [0.5, 30], [0.75, 18], [1, 26]], grip: [[0, 0.2], [1, 0.2]],
      shLp: [[0, -10], [1, -10]], shLr: [[0, 8], [1, 8]], elL: [[0, 30], [1, 30]],
    }) });
  // the mourner of the ring who is not of the dead's own: the hands joined before the belly, the head bowed to the grave, a slow
  // breath — the eyes on the grave (no look of its own: the scene's focus turns the head)
  K('ato-luto-roda', { dur: 6, base: 'idle', mask: 'upper', in: 0.5, out: 0.5, events: { contact: 0.5 },
    keys: { shLp: [[0, -30], [1, -30]], shRp: [[0, -30], [1, -30]], shLr: [[0, -8], [1, -8]], shRr: [[0, 8], [1, 8]], elL: [[0, 74], [1, 74]], elR: [[0, 74], [1, 74]],
      shLy: [[0, -52], [1, -52]], shRy: [[0, 52], [1, 52]], grip: [[0, 0.35], [1, 0.35]], gripL: [[0, 0.35], [1, 0.35]],
      neck: [[0, 24], [0.5, 28], [1, 24]], lean: [[0, 5], [0.5, 6], [1, 5]] } });
  // the drill: the guard, the step and the thrust at the stroke, back to the guard — on the drill's clock (period 4 s)
  K('ato-treino', { dur: 4, period: 4, base: 'idle', mask: 'upper', in: 0.3, out: 0.3, events: { contact: 0.9 }, acts: ['drill'],
    keys: {
      shRp: [[0, -40], [0.75, -46], [0.88, -84], [0.92, -86], [1, -40]], shRr: [[0, -10], [0.88, -2], [1, -10]], elR: [[0, 84], [0.75, 90], [0.88, 12], [0.92, 10], [1, 84]],
      shLp: [[0, -52], [0.88, -40], [1, -52]], shLr: [[0, 14], [1, 14]], elL: [[0, 92], [0.88, 70], [1, 92]], grip: [[0, 1], [1, 1]], gripL: [[0, 0.8], [1, 0.8]],
      lean: [[0, 4], [0.75, 2], [0.88, 12], [0.95, 10], [1, 4]], twist: [[0, -10], [0.75, -14], [0.88, 8], [1, -10]], neck: [[0, -4], [1, -4]],
    } });
})(window.G);
