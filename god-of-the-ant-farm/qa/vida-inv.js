// vida-inv: what must always be true of the life that is seen while the game runs (22c, QA.more — loaded after qa/qa.js by the
// tests of the 3D; inlined into qa.js by qa/junta-inv.js):
//   · every act a person has now is shown: a gesture, a posture, or its family's pose in the society's vocabulary — none falls
//     to the plain stance but those the world means to stand (S3: a gap of the drawing, not of the world; D-602, D-603)
//   · the porte the reader gives is made of numbers in their range, and never of the look nor the people (S2; D-594)
//   · the face a person is posed with has the channels of G.Rosto, each in its range (S2; D-543, D-601)
//   · the view keeps nobody who is gone: a person of the view's memory is a person of the world (S3; D-591)
(function (G) {
  // (the acts that are a stance on purpose: the stance is their pose)
  const STAND = new Set(['', 'stand', 'idle', 'sleep', 'zzz', 'run', 'carry', 'haul', 'lift', 'drag', 'hold', 'carry2', 'arrange', 'give']);
  const inv = function (add, s) {
    const A = G.Anim3D, V3 = G.Vida3D; if (!A || !A.stateOf || !V3 || !s || !s.villagers) return;
    let n = 0;
    for (const v of s.villagers.values()) {
      if (v.act && !STAND.has(v.act) && !v.sleeping && !(v.task && v.task.type === 'swim')) { const st = A.stateOf(v, 0); if (st === 'idle' && ++n <= 3) add('vida', 3, `#${v.id}: o ato «${v.act}» sem pose no desenho (cai em «parado»)`); }
      const p = V3.porteOf(v, {}); for (const k of V3.PORTE) { const x = p[k], lo = k === 'confia' || k === 'manca' ? -1 : 0; if (!(x >= lo && x <= 1)) { add('vida', 2, `#${v.id}: o porte «${k}» fora da faixa (${x})`); break; } }
    }
    const P3 = G.People3D, R = G.Rosto; if (!P3 || !P3.visOf || !R) return;
    for (const w of P3.walkers || []) { const id = w[7]; const vs = P3.visOf(id); if (!vs) continue;
      if (!s.villagers.has(id)) add('vida', 3, `a vista desenha #${id}, que não está no mundo`);
      const F = vs.pose && vs.pose.face; if (!F) continue; if (F.length !== R.CH.length) { add('vida', 2, `#${id}: o rosto com ${F.length} canais (o G.Rosto tem ${R.CH.length})`); continue; }
      for (let i = 0; i < F.length; i++) if (!(F[i] >= R.LOW[i] && F[i] <= R.HIGH[i])) { add('vida', 2, `#${id}: o canal «${R.CH[i]}» do rosto fora da faixa (${F[i]})`); break; } }
  };
  G.VidaInv = inv;
  if (typeof QA !== 'undefined' && QA.more) QA.more.push(inv);
})(window.G);
