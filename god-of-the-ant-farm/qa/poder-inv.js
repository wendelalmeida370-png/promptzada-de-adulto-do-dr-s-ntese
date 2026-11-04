// poder-inv: as regras do verificador para os degraus maiores dos prédios de poder (D-106, a Arquitetura Monumental; o
// especialista M2) — carregado depois do qa/qa.js (QA.more), como o escala-inv.js; o líder o junta (qa/junta-inv.js). Lê o
// prédio e o seu registro e pergunta ao G.Forma e ao G.Interiors (nenhuma pergunta muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const In = G.Interiors, Fo = G.Forma; if (!In || !In.riskOf || !Fo) return;
    for (const b of s.buildings.values()) {
      if (b.type === 'ruin' || !b.ip || !G.BDEF[b.type] || b.w === G.BDEF[b.type].w) continue;
      // ---- the palace of a bigger step is laid out by its form — the risk the god paints (forma-poder.js) —: its record in the
      // form's family, never in a recipe's (another palace than the one drawn: the body would walk other walls; L-510, a record of
      // ten given a recipe's family where the catalogue answered with the classic size's row)
      const st = b.style || 'classico'; if (!Fo.has(b.type, st, b.w)) continue; const F = Fo.of(b.type, st, b.w); if (!In.riskOf(F)) continue;
      if (b.ip.f !== 'forma.palacio') add('poder', 2, `${b.type}#${b.id} (${st}, ${b.w} casas): a planta da família ${b.ip.f}, não a da forma (forma.palacio) — o corpo andaria noutro palácio que o desenhado`);
    }
  });
})();
