// corpo-fera-inv: as regras do verificador do corpo diante das feras (D-330 a D-334) — carregado depois do qa/qa.js (QA.more),
// juntado a ele pelo qa/junta-inv.js. Lê o corpo encarnado, os bichos e o G.Corpo — nenhuma pergunta muda o mundo. O sistema
// «corpo-fera»:
//   · o corpo nunca dentro de um bicho (S2): o círculo do corpo que o deus vive não entra mais de 12 cm na pegada de um bicho que
//     fica no caminho (G.Corpo.stands: os pequenos, as cobras, as aves do chão e as carcaças pequenas não contam) — o dono
//     entrou num hipopótamo no rio;
//   · nenhum golpe esquecido (S3): um golpe dado ao corpo (G.Corpo.pending) acerta ou erra no passo em que chega a hora dele —
//     dois segundos depois ainda à espera é golpe preso;
//   · os golpes que o corpo levou (S.avatar.hits) são poucos e com números (S3).
(function () {
  if (!window.QA || !QA.more) return;
  const rule = function (add, s) {
    const Co = G.Corpo; const a = s.avatar; if (!Co || !a) return;
    const v = s.villagers.get(a.id);
    if (v && !v.inside && !v.aboard && !v.ug && !v.held && !v.air && G.Animals && G.Animals.near) {
      const R = Co.BODY_R / Co.TILE;
      G.Animals.near(v.x, v.y, 4, b => {
        if (!Co.stands(b)) return; const f = Co.foot(b); if (!f) return;
        const over = (f[4] + R - Co.near(f, v.x, v.y)[2]) * Co.TILE;
        if (over > 0.12) add('corpo-fera', 2, `${v.name} #${v.id}, o corpo do deus, está ${Math.round(over * 100)} cm dentro de ${G.Animals.DEF[b.kind].nameA} #${b.id} (${b.state})`, v.id);
      });
    }
    for (const p of Co.pending ? Co.pending() : []) if (p.at < s.clock - 2) add('corpo-fera', 3, `um golpe de ${p.kind} #${p.a} no corpo #${p.v} preso: devia ter chegado ${(s.clock - p.at).toFixed(1)} s atrás`, p.v);
    const H = a.hits;
    if (H !== undefined && (!Array.isArray(H) || H.length > 8 || H.some(e => !e || !Number.isFinite(e.n) || !Number.isFinite(e.t) || !Number.isFinite(e.amt) || e.t > s.clock + 1e-6))) add('corpo-fera', 3, 'S.avatar.hits: os golpes que o corpo levou malformados ou demais');
  };
  QA.more.push(rule); QA.corpoFera = rule;
})();
