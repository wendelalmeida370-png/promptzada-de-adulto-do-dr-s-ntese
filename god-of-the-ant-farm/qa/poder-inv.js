// poder-inv: as regras do verificador para os degraus maiores dos prédios de poder, fé e convívio (D-106, a Arquitetura
// Monumental; o especialista M2) — carregado depois do qa/qa.js (QA.more), como o escala-inv.js; o líder o junta
// (qa/junta-inv.js). Lê o prédio e o seu registro e pergunta ao G.Forma e ao G.Interiors (nenhuma pergunta muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  QA.more.push(function (add, s) {
    const In = G.Interiors, Fo = G.Forma; if (!In || !In.riskOf || !Fo) return;
    for (const b of s.buildings.values()) {
      if (b.type === 'ruin' || !b.ip || !G.BDEF[b.type] || b.w === G.BDEF[b.type].w) continue;
      // ---- the palace and the temple of a bigger step are laid out by their form — the risk the god paints (forma-poder.js) —:
      // the record in the form's family (the risk's: forma.palacio, forma.templo), never in a recipe's (another building than the
      // one drawn: the body would walk other walls; L-510, a record of ten given a recipe's family where the catalogue answered
      // with the classic size's row). A type with no form — the tavern, the house — has its bigger steps' family (stepFam: the
      // inn's, the rich house's): the record of such a step in it, never in a recipe's of the classic lot
      const st = b.style || 'classico'; let fam = null;
      if (Fo.has(b.type, st, b.w)) { const R = In.riskOf(Fo.of(b.type, st, b.w)); if (R) fam = R.fam || 'forma.palacio'; }
      if (!fam && In.TYPES[b.type] && In.TYPES[b.type].stepFam) fam = In.TYPES[b.type].stepFam;
      if (!fam) continue;
      if (b.ip.f !== fam) add('poder', 2, `${b.type}#${b.id} (${st}, ${b.w} casas): a planta da família ${b.ip.f}, não a do degrau (${fam}) — o corpo andaria noutro prédio que o desenhado`);
    }
  });
})();
