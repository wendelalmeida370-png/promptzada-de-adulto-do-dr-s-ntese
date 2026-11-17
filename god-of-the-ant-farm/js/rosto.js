// rosto: the channels of a face (SOCIEDADE.md §3.3, D-543) — the words between the life that is seen (22c: the animation writes
// pose.face every frame — the mood beneath, the feeling of the moment, the gesture, the blink, the look, the speech) and the body
// (22a: Body3D draws each channel as it will — shapes, the bones of the jaw and the lids, the paint). Pure: a list and its ranges —
// no world, no chance, no THREE. A channel the body does not draw breaks nothing; a channel not in the list does not exist (rule 196).
(function (G) {
  'use strict';
  // [name, low, high, at rest] — what each moves
  const DEF = [
    ['blink', 0, 1, 0], //      the lids: 0 open … 1 shut (the blink, sleep, a wince)
    ['gazeX', -0.45, 0.45, 0], // the eyes to the side
    ['gazeY', -0.3, 0.3, 0], //  the eyes up and down
    ['jaw', 0, 1, 0], //        the mouth open: the «a» of speech, the laugh, the shout, the yawn, the teeth that chatter in the cold
    ['smile', -1, 1, 0], //     the corners of the mouth up (+) or down (−)
    ['smileSide', -1, 1, 0], // one corner more than the other: − the left, + the right (the crooked smile of drink, the smirk)
    ['browUp', 0, 1, 0], //     the brows up: surprise, fear
    ['browIn', 0, 1, 0], //     the brows down and together: anger, effort, a hard look
    ['browSad', 0, 1, 0], //    the inner ends up: sorrow, worry, pleading
    ['wide', 0, 1, 0], //       the eyes wide open: fear, surprise
    ['squint', 0, 1, 0], //     the eyes narrowed: laughter, distrust, a hard sun
    ['sneer', 0, 1, 0], //      the upper lip and the nose: disgust, contempt
    ['pucker', 0, 1, 0], //     the lips forward: the «o» and «u» of speech, a kiss, a whistle
    ['press', 0, 1, 0], //      the lips pressed: the «m b p» of speech, anger held in, effort
    ['stretch', 0, 1, 0], //    the lips stretched wide: the «e i» of speech, fear, pain
    ['pain', 0, 1, 0], //       a grimace: a wound, a heavy blow, a weight
    ['cry', 0, 1, 0], //        tears: the wet eye, the wet cheek
    ['blush', 0, 1, 0], //      the cheeks warm: love, shame, drink, heat
    ['sweat', 0, 1, 0], //      the skin that shines: heat, effort, fever
    ['pale', 0, 1, 0], //       the colour gone: sickness, terror
  ];
  const R = G.Rosto = {};
  R.CH = Object.freeze(DEF.map(d => d[0]));
  R.IDX = Object.freeze(Object.fromEntries(R.CH.map((k, i) => [k, i])));
  R.LOW = Float32Array.from(DEF.map(d => d[1]));
  R.HIGH = Float32Array.from(DEF.map(d => d[2]));
  R.REST = Float32Array.from(DEF.map(d => d[3]));
  R.has = k => Object.prototype.hasOwnProperty.call(R.IDX, k);
  // a face at rest (a fresh array: the pose of each person keeps its own)
  R.fresh = () => Float32Array.from(R.REST);
  // the face kept within the ranges (what reaches the body is always a face that can be drawn)
  R.clamp = function (face) {
    for (let i = 0; i < face.length && i < R.CH.length; i++) { const x = face[i]; face[i] = !(x === x) ? R.REST[i] : x < R.LOW[i] ? R.LOW[i] : x > R.HIGH[i] ? R.HIGH[i] : x; }
    return face;
  };
})(window.G);
