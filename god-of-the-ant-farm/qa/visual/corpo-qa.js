// corpo-qa: what must always be true of the body's hands on the world (QA.more, loaded after qa/qa.js by the tests of the
// body — inlined into qa.js when the Modo Encarnado's foundation lands):
//   · what the hands asked of the world and the world has not yet done belongs to the body lived now: a body given back, or
//     dead, leaves nothing waiting (it never happened — Possess.release and the death drop it)
(function (G) {
  QA.more.push(function (add, s) {
    if (!G.Possess || !G.Possess.queued) return;
    const q = G.Possess.queued(); const a = s.avatar;
    if (!a && q.length) add('maos', 1, `${q.length} pedido(s) das mãos esperando o passo do mundo sem ninguém encarnado: o corpo devolvido deixou o que pediu`);
    if (a) { const o = q.filter(id => id !== a.id); if (o.length) add('maos', 1, `${o.length} pedido(s) das mãos de outro corpo (#${o[0]}) esperando o passo do mundo, com #${a.id} encarnado`); }
  });
})(window.G);
