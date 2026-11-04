// monumental-inv: as regras do verificador para os degraus grandes dos monumentos (D-106, D-107, D-108; o M1) — carregado depois do
// qa/qa.js (QA.more), como o escala-inv.js; o líder o junta (qa/junta-inv.js). Lê o prédio e pergunta ao G.Forma e às portas do
// G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const WATCH = 600; // (the Colosseum's least: the places to watch from seated, reached from its door — PLANO.md §7, test A)
  // (the places of the rite on the top storey of the Great Pyramid and of the Templo Mayor — the offering before the sarcophagus
  // and those who pray about it; the priest before each shrine's door and at each brazier —, each one the body takes, D-108)
  const RITE = { piramide: { ofertar: 1, rezar: 2 }, mayor: { oficiar: 2, acender: 2 } };
  QA.more.push(function (add, s) {
    const In = G.Interiors, Fo = G.Forma; if (!In || !Fo) return;
    for (const b of s.buildings.values()) {
      if (!b.built || b.type !== 'maravilha' || !b.ip) continue;
      const F = Fo.of(b.type, b.style || 'classico', b.w); const A = F && F.amphi; if (!A || !(A.oval || A.piramide || A.mayor)) continue;
      const O = A.oval, p = In.plan(b);
      if (O) {
        // ---- the Colosseum (the split oval, D-107): its plan stands, on the form's floors — the sand at the form's height —, and
        // seats the crowd its step is built for, each seat reached from its door (a plan that does not stand leaves the body and
        // the people nowhere to walk in the biggest building of the town)
        if (!p || !p.ok) { add('monumental', 1, `${b.type}#${b.id} (${b.style}, ${b.w} casas): a planta do anfiteatro não se arma (${p ? p.errs.slice(0, 2).join('; ') : 'sem planta'})`); continue; }
        const l1 = p.levels.find(l => l.lv === 1);
        if (!l1 || Math.abs(l1.y - O.ya) > 0.01) add('monumental', 1, `${b.type}#${b.id}: a areia da planta a ${l1 ? l1.y.toFixed(2) : '—'} m e a da forma a ${O.ya.toFixed(2)} m — o corpo andaria noutro chão que o visto`);
        if ((p.cap.watch || 0) < WATCH) add('monumental', 2, `${b.type}#${b.id} (${b.w} casas): ${p.cap.watch || 0} lugares de assistir sentados que a porta alcança (o Coliseu tem ${WATCH} ao menos)`);
        continue;
      }
      // ---- the Great Pyramid and the Templo Mayor (D-108): the plan stands, its top storey — the king's chamber up the gallery, the
      // top of the terraces up the double stair — at the form's height, and there the places of the rite, each one the body takes
      // (a wonder whose chamber or whose top the plan puts elsewhere than the form has it: the body would walk in the stone, or
      // in the air over the shrines)
      const k = A.piramide ? 'piramide' : 'mayor', top = A.piramide ? A.piramide.yK : A.mayor.H;
      const what = A.piramide ? 'a câmara do rei' : 'o alto do templo', where = A.piramide ? 'na câmara do rei' : 'no alto do templo';
      if (!p || !p.ok) { add('monumental', 1, `${b.type}#${b.id} (${b.style}, ${b.w} casas): a planta da maravilha não se arma (${p ? p.errs.slice(0, 2).join('; ') : 'sem planta'})`); continue; }
      const l1 = p.levels.find(l => l.lv === 1);
      if (!l1 || Math.abs(l1.y - top) > 0.01) { add('monumental', 1, `${b.type}#${b.id} (${b.style}): ${what} a ${l1 ? l1.y.toFixed(2) : '—'} m na planta e a ${top.toFixed(2)} m na forma — o corpo andaria noutro chão que o visto`); continue; }
      for (const use in RITE[k]) {
        const got = (p.marks || []).filter(M => M.lv === 1 && M.use === use).reduce((n, M) => n + M.pts.filter(q => q.ok).length, 0);
        if (got < RITE[k][use]) add('monumental', 2, `${b.type}#${b.id} (${b.style}): ${got} lugares de ${use} ${where} que o corpo toma (${RITE[k][use]} ao menos)`);
      }
    }
  });
})();
