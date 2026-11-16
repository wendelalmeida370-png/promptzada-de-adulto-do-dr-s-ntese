// anim-inv: what must always be true of the people's animation while the game runs (20a, QA.more — loaded after qa/qa.js by
// the tests of the body; to be inlined into qa.js by qa/junta-inv.js at the junction of the wave):
//   · every clip registered whole: no clip refused (a second with one id, keys out of their time, an event out of 0..1, an act
//     shown by two clips — G.Anim3D.clipErr), and every act the table links to a clip links to one that exists (D-342)
//   · the body drawn is the body lived: the controller's feed (G.People3D.avatar) is of the body the player lives now, or of
//     none — never of a body given back, dead, or of a world that ended (L-1112)
(function (G) {
  const inv = function (add, s) {
    const A = G.Anim3D; if (!A || !A.CLIPS) return;
    for (const e of A.clipErr || []) add('animacao', 2, `um clipe recusado: ${e}`);
    const co = A.CLIP_OF || {}; for (const k in co) if (!A.CLIPS[co[k]]) add('animacao', 2, `o ato «${k}» mostra o clipe «${co[k]}», que não existe`);
    const P3 = G.People3D, f = P3 && P3.avatar; if (!f) return;
    const a = s && s.avatar; if (!a) add('animacao', 3, `o desenho de um corpo (#${f.id}) sem ninguém encarnado`);
    else if (f.id !== a.id) add('animacao', 3, `o desenho do corpo #${f.id} com #${a.id} encarnado`);
  };
  G.AnimInv = inv;
  if (typeof QA !== 'undefined' && QA.more) QA.more.push(inv);
})(window.G);
