// escala-inv: as regras do verificador para a escala de cada prédio (D-106, a Arquitetura Monumental) — carregado depois do
// qa/qa.js (QA.more), como o forma-inv.js; o líder o junta (qa/junta-inv.js). Lê o prédio e pergunta ao G.Escala, ao G.Forma
// e ao G.Interiors (nenhuma pergunta muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const Es = G.Escala, Fo = G.Forma, In = G.Interiors; if (!Es) return;
    for (const b of s.buildings.values()) {
      if (b.type === 'ruin' || !G.BDEF[b.type]) continue;
      // ---- the lot is a step of the type's ladder: square, of a size the ladder has (a building of before, its type's own)
      if (b.w !== b.h) add('escala', 2, `${b.type}#${b.id}: o lote de ${b.w} × ${b.h} casas — todo lote é quadrado (D-106)`);
      else if (!Es.steps(b.type).some(st => st.n === b.w)) add('escala', 2, `${b.type}#${b.id}: o lote de ${b.w} casas não é um degrau da escada do tipo (${Es.steps(b.type).map(st => st.n).join(', ')})`);
      // ---- the lot, the form and the plan of one size: a type with a form has one at the building's size (the god and the body
      // draw it, the plan reads it), and the plan's record keeps the building's lot — else the three would be three buildings
      const st = b.style || 'classico';
      if (Fo && Fo.has(b.type, st)) {
        const F = Fo.of(b.type, st, b.w);
        if (!F) add('escala', 1, `${b.type}#${b.id} (${st}): ${b.w} × ${b.w} casas e nenhuma forma desse tamanho — o deus, o corpo e a planta não teriam o que desenhar`);
        else if (Math.abs(F.L - b.w * 4) > 1e-6) add('escala', 1, `${b.type}#${b.id}: a forma de ${F.L} m num lote de ${b.w * 4} m`);
      }
      if (b.ip && In && In.nOf && In.nOf(b.ip) !== b.w) add('escala', 1, `${b.type}#${b.id}: o registro da planta é de um lote de ${In.nOf(b.ip)} casas e o prédio tem ${b.w} — a planta seria de outro prédio`);
    }
  });
})();
