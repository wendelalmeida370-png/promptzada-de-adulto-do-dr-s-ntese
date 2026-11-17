// interacao-inv: as regras do verificador para a interação do corpo com o ambiente (20e, D-395 a D-409) — carregado depois do
// qa/qa.js (QA.more), como os outros; o qa/junta-inv.js o copia para dentro do qa.js. Só lê o mundo.
//   · o que está no chão (S.loose, fora das caixas de um serviço) é uma coisa ou um bem do catálogo, em quantidade que se pega,
//     num lugar do mapa — o que o corpo pega e larga passa por ali;
//   · as mãos movem as coisas pelas portas certas, no livro: o que se dá vai de uma mochila para outra (G.Inv.give, «dar»), o que
//     se apanha do chão vai do chão para uma mochila («apanhou»), o que se guarda ou se tira de uma casa, uma prateleira, uma
//     banca vai entre a mochila e esse lugar («guardou» / «pegar») — nunca para o estoque do povo como coisa (D-371);
//   · os feitos das mãos do corpo (deu, pegou do chão, guardou, bateu à porta) são contas inteiras, nunca negativas.
(function () {
  if (!window.QA || !QA.more) return;
  const fin = x => typeof x === 'number' && isFinite(x);
  QA.more.push(function (add, s) {
    const It = G.Itens, D = G.Depot; if (!It || !D) return;
    // ---- the ground: what lies there is something a hand can take
    for (const o of s.loose || []) {
      if (o.op) continue;
      if (!It.def(o.k) && o.k !== 'water' && o.k !== 'moedas') add('interacao', 2, `no chão #${o.id}: «${o.k}», que o catálogo não conhece`);
      if (!fin(o.x) || !fin(o.y) || !G.W.inb(o.x, o.y)) add('interacao', 1, `no chão #${o.id}: fora do mapa (${o.x}, ${o.y})`);
    }
    // ---- the doors the hands move things by (the ledger lines of today)
    const L = D.ledger ? D.ledger() : []; const day = s.day; const kind = r => (typeof r === 'string' ? r.split(':')[0] : '');
    for (let i = L.length - 1; i >= 0 && L[i][1] >= day - 1; i--) {
      const e = L[i]; const code = e[8], de = e[3], para = e[4];
      if (code === 'dar' && (kind(de) !== 'm' || kind(para) !== 'm' || de === para)) add('interacao', 1, `o livro: «dar» de ${de} para ${para} — o que se dá vai de uma mochila para a de outra pessoa (G.Inv.give)`);
      if (code === 'apanhou' && (kind(de) !== 'g' || kind(para) !== 'm')) add('interacao', 1, `o livro: «apanhou» de ${de} para ${para} — o que se apanha vai do chão para uma mochila (G.Inv.pick)`);
      if ((code === 'guardou' || code === 'pegar') && kind(para) === 'f' && It.THINGS && It.THINGS.has(e[5])) add('interacao', 1, `o livro: uma coisa (${e[5]}) entrou no estoque do povo como coisa por «${code}» (D-371: conta como o seu bem)`);
    }
    // ---- the body's deeds of the hands: whole counts
    const a = s.avatar; if (a && a.deeds) for (const k of ['dadiva', 'apanhou', 'guardou', 'porta']) { const n = a.deeds[k]; if (n !== undefined && (!fin(n) || n < 0 || Math.abs(n - Math.round(n)) > 1e-9)) add('interacao', 2, `o feito «${k}» do corpo é ${n}`); }
  });
})();
