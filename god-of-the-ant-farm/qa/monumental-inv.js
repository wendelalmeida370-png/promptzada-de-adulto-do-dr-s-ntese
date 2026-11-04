// monumental-inv: as regras do verificador para os degraus grandes dos monumentos (D-106, D-107; o M1) — carregado depois do
// qa/qa.js (QA.more), como o escala-inv.js; o líder o junta (qa/junta-inv.js). Lê o prédio e pergunta ao G.Forma e às portas do
// G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const WATCH = 600; // (the Colosseum's least: the places to watch from seated, reached from its door — PLANO.md §7, test A)
  QA.more.push(function (add, s) {
    const In = G.Interiors, Fo = G.Forma; if (!In || !Fo) return;
    for (const b of s.buildings.values()) {
      if (!b.built || b.type !== 'maravilha' || !b.ip) continue;
      const F = Fo.of(b.type, b.style || 'classico', b.w); const O = F && F.amphi && F.amphi.oval; if (!O) continue;
      // ---- the Colosseum (the split oval, D-107): its plan stands, on the form's floors — the sand at the form's height —, and
      // seats the crowd its step is built for, each seat reached from its door (a plan that does not stand leaves the body and
      // the people nowhere to walk in the biggest building of the town)
      const p = In.plan(b);
      if (!p || !p.ok) { add('monumental', 1, `${b.type}#${b.id} (${b.style}, ${b.w} casas): a planta do anfiteatro não se arma (${p ? p.errs.slice(0, 2).join('; ') : 'sem planta'})`); continue; }
      const l1 = p.levels.find(l => l.lv === 1);
      if (!l1 || Math.abs(l1.y - O.ya) > 0.01) add('monumental', 1, `${b.type}#${b.id}: a areia da planta a ${l1 ? l1.y.toFixed(2) : '—'} m e a da forma a ${O.ya.toFixed(2)} m — o corpo andaria noutro chão que o visto`);
      if ((p.cap.watch || 0) < WATCH) add('monumental', 2, `${b.type}#${b.id} (${b.w} casas): ${p.cap.watch || 0} lugares de assistir sentados que a porta alcança (o Coliseu tem ${WATCH} ao menos)`);
    }
  });
})();
