// canteiro-inv: as regras do verificador para a carroça da obra grande (Bairros Vivos, o agente M, 2ª rodada: D-215) — carregado
// depois do qa/qa.js (QA.more), como o degraus-inv.js; o líder o junta (qa/junta-inv.js). Lê as carroças e as obras; nenhuma
// pergunta muda o mundo.
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Ci = G.City; if (!Ci || !Ci.workCart) return;
    const aCaminho = new Map();
    for (const c of s.carts || []) {
      if (!c.obra) continue;
      // ---- a great work's cart is no road's: its own way, one material, a load of WORK_LOAD at most
      if (c.route) add('canteiro', 2, `a carroça #${c.id} é de uma obra (#${c.obra}) e de uma rota (#${c.route})`);
      if (!Array.isArray(c.pts) || c.pts.length < 2) add('canteiro', 2, `a carroça da obra #${c.id} não tem caminho`);
      const L = c.back ? c.ret : c.goods; const n = L ? L.n || 0 : 0;
      if (n > Ci.WORK_LOAD + 1e-6) add('canteiro', 2, `a carroça da obra #${c.id} leva ${n} de ${L.k} (mais que ${Ci.WORK_LOAD})`);
      if (!c.back && c.ret && c.ret.n > 1e-6) add('canteiro', 2, `a carroça da obra #${c.id}, de ida, com carga de volta`);
      if (c.back && c.goods && c.goods.n > 1e-6) add('canteiro', 2, `a carroça da obra #${c.id}, de volta, com carga de ida`);
      if (!c.back) aCaminho.set(c.obra, (aCaminho.get(c.obra) || 0) + 1);
    }
    for (const [id, n] of aCaminho) if (n > Ci.WORK_CARTS) add('canteiro', 2, `${n} carroças a caminho da obra #${id} (no máximo ${Ci.WORK_CARTS})`);
  });
})();
