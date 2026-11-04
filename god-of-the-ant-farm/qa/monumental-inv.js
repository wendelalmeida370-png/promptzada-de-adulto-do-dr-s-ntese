// monumental-inv: as regras do verificador para os degraus grandes dos monumentos (D-106 a D-109; o M1) — carregado depois do
// qa/qa.js (QA.more), como o escala-inv.js; o líder o junta (qa/junta-inv.js). Lê o prédio e pergunta ao G.Forma e às portas do
// G.Interiors (fazer uma planta não muda o mundo).
(function () {
  if (!window.QA || !QA.more) return;
  const WATCH = 600; // (the Colosseum's least: the places to watch from seated, reached from its door — PLANO.md §7, test A)
  // (the places of the rite on the top storey of the Great Pyramid and of the Templo Mayor — the offering before the sarcophagus
  // and those who pray about it; the priest before each shrine's door and at each brazier —, each one the body takes, D-108)
  const RITE = { piramide: { ofertar: 1, rezar: 2 }, mayor: { oficiar: 2, acender: 2 } };
  // (the least a theatre of each step seats, reached from its door — the monumental's 300 of PLANO.md §7, test E, with room to
  // spare: its rows seat 800 and more —, D-109)
  const SEATS = { 6: 250, 8: 350, 10: 600 };
  // (and the great ball court's stands on its walls — the Aztec's theatre: its rows seat 80, 112 and 204 —, D-109)
  const STANDS = { 6: 60, 8: 90, 10: 160 };
  QA.more.push(function (add, s) {
    const In = G.Interiors, Fo = G.Forma; if (!In || !Fo) return;
    for (const b of s.buildings.values()) {
      if (!b.built || !b.ip || (b.type !== 'maravilha' && b.type !== 'teatro')) continue;
      const F = Fo.of(b.type, b.style || 'classico', b.w); const A = F && F.amphi; if (!A || !(A.oval || A.piramide || A.mayor || A.teatro || A.campo)) continue;
      const O = A.oval, p = In.plan(b);
      if (A.campo) {
        // ---- the great ball court (D-109): its plan stands, the stands on its walls at the form's height, their rows seating the
        // crowd its step is built for
        if (!p || !p.ok) { add('monumental', 1, `${b.type}#${b.id} (${b.style}, ${b.w} casas): a planta do campo de bola não se arma (${p ? p.errs.slice(0, 2).join('; ') : 'sem planta'})`); continue; }
        const l1 = p.levels.find(l => l.lv === 1);
        if (!l1 || Math.abs(l1.y - A.campo.Hw) > 0.01) add('monumental', 1, `${b.type}#${b.id} (${b.style}): as arquibancadas da planta a ${l1 ? l1.y.toFixed(2) : '—'} m e as da forma a ${A.campo.Hw.toFixed(2)} m — o corpo andaria noutro chão que o visto`);
        if ((p.cap.watch || 0) < (STANDS[b.w] || 0)) add('monumental', 2, `${b.type}#${b.id} (${b.style}, ${b.w} casas): ${p.cap.watch || 0} lugares de assistir sentados que a porta alcança (o degrau tem ${STANDS[b.w]} ao menos)`);
        continue;
      }
      if (A.teatro) {
        // ---- the theatre of a city (D-109): its plan stands, the Roman's stage at the form's height, and its rows seat the crowd
        // its step is built for, each seat reached from its door
        const T = A.teatro;
        if (!p || !p.ok) { add('monumental', 1, `${b.type}#${b.id} (${b.style}, ${b.w} casas): a planta do teatro não se arma (${p ? p.errs.slice(0, 2).join('; ') : 'sem planta'})`); continue; }
        const l1 = p.levels.find(l => l.lv === 1);
        if (T.st === 'romano' && (!l1 || Math.abs(l1.y - T.ys) > 0.01)) add('monumental', 1, `${b.type}#${b.id} (${b.style}): o palco da planta a ${l1 ? l1.y.toFixed(2) : '—'} m e o da forma a ${T.ys.toFixed(2)} m — o corpo andaria noutro chão que o visto`);
        if ((p.cap.watch || 0) < (SEATS[b.w] || 0)) add('monumental', 2, `${b.type}#${b.id} (${b.style}, ${b.w} casas): ${p.cap.watch || 0} lugares de assistir sentados que a porta alcança (o degrau tem ${SEATS[b.w]} ao menos)`);
        continue;
      }
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
